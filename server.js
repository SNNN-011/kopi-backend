// server.js

const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

const rateLimit = require('express-rate-limit');

// Batasi login: max 10 percobaan per 15 menit per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Terlalu banyak percobaan login, coba lagi 15 menit lagi' }
});

app.use('/api/auth/login', loginLimiter);

// Konfigurasi CORS yang sudah diperbaiki
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://kopi-pure.vercel.app' // URL Vercel yang valid
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Routes — Di-comment sementara agar server tidak crash karena file belum ada

const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');
const paymentRoutes = require('./routes/payment');

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payment',  paymentRoutes);


// Endpoint utama untuk validasi status server
app.get('/', (req, res) => {
  res.json({ message: '🍵 Backend Pure Coffee API berjalan!' });
});

// Menggunakan PORT dari environment (Railway 8080) atau fallback ke 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});