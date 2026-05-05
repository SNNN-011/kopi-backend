// routes/auth.js

const express  = require('express')
const router   = express.Router()
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const User     = require('../models/User')

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nama, email, password } = req.body

    // Cek email sudah terdaftar
    const sudahAda = await User.findOne({ email })
    if (sudahAda) {
      return res.status(400).json({ message: 'Email sudah terdaftar' })
    }

    // Hash password
    const salt           = await bcrypt.genSalt(10)
    const passwordHash   = await bcrypt.hash(password, salt)

    // Simpan user baru
    const user = await User.create({
      nama,
      email,
      password: passwordHash
    })

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: { id: user._id, nama: user.nama, email: user.email }
    })
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Cek user ada
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Email atau password salah' })
    }

    // Cek password
    const cocok = await bcrypt.compare(password, user.password)
    if (!cocok) {
      return res.status(400).json({ message: 'Email atau password salah' })
    }

    // Buat JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login berhasil',
      token,
      user: { id: user._id, nama: user.nama, email: user.email, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
})


// GET /api/users — Ambil semua user (Admin Only)
const { verifyToken, isAdmin } = require('../middleware/auth')

// Tambahkan verifyToken dan isAdmin sebelum (req, res)
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data user' });
  }
});

// routes/auth.js

// ... (kode sebelumnya)

// PUT /api/auth/users/:id/role — Mengubah role user (Admin Only)
router.put('/users/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    // Validasi agar role yang dimasukkan hanya 'user' atau 'admin'
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true } // Mengembalikan data user yang sudah diupdate
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    res.json({ message: `Role ${user.nama} berhasil diubah menjadi ${role}`, user });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui role' });
  }
});

module.exports = router