// config/db.js — versi Vercel (tanpa process.exit)

const mongoose = require('mongoose')

let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    console.log('✅ Pakai koneksi MongoDB yang sudah ada')
    return
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    isConnected = db.connections[0].readyState === 1
    console.log('✅ MongoDB terhubung')
  } catch (err) {
    console.error('❌ Gagal koneksi MongoDB:', err.message)
    // JANGAN pakai process.exit(1) di Vercel — bikin function crash!
    throw err
  }
}

module.exports = connectDB
