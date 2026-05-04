// config/db.js — Koneksi ke MongoDB

const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB terhubung')
  } catch (err) {
    console.error('❌ Gagal koneksi MongoDB:', err.message)
    process.exit(1) // hentikan server jika DB gagal
  }
}

module.exports = connectDB