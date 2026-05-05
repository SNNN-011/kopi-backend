// server.js — sementara tanpa routes dulu

const express   = require('express')
const cors      = require('cors')
const dotenv    = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()
connectDB()

const app = express()
// ✅ Fix
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_API_URL,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))
app.use(express.json())

// Routes — aktifkan satu per satu setelah file-nya dibuat
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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`)
})