// server.js

const express   = require('express')
const cors      = require('cors')
const connectDB = require('./config/db')

// Hanya load dotenv di local, Railway inject env otomatis
const PORT = process.env.PORT || 7860
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`)
})

// Izinkan semua origin di production, ganti dengan URL frontend kamu setelah deploy
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Routes
const authRoutes    = require('./routes/auth')
const productRoutes = require('./routes/products')
const orderRoutes   = require('./routes/orders')
const paymentRoutes = require('./routes/payment')

app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/payment',  paymentRoutes)

app.get('/', (req, res) => {
  res.json({ message: '🍵 Kopi Toko API berjalan!' })
})

// Untuk local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`)
  })
}

// WAJIB untuk Vercel — export app sebagai module
module.exports = app
