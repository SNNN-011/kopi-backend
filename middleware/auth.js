// middleware/auth.js — verifikasi JWT token

const jwt = require('jsonwebtoken')

// Cek user sudah login
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, login dulu' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, role }
    next()
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid' })
  }
}

// Cek user adalah admin
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Hanya admin yang bisa akses' })
  }
  next()
}

module.exports = { verifyToken, isAdmin }