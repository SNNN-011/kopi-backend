// routes/products.js

const express                    = require('express')
const router                     = express.Router()
const Product                    = require('../models/Product')
const { verifyToken, isAdmin }   = require('../middleware/auth')
const connectDB = require('../config/db')

// GET /api/products — ambil semua produk (publik)
router.get('/', async (req, res) => {
  try {
    await connectDB() // ← tambah ini di dalam handler
    
    const { kategori, search } = req.query
    let filter = { tersedia: true }
    if (kategori) filter.kategori = kategori
    if (search) filter.nama = { $regex: search, $options: 'i' }

    const products = await Product.find(filter).sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    console.error('❌ Error products:', err)
    res.status(500).json({ message: err.message })
  }
})

// GET /api/products/:id — detail produk (publik)
router.get('/:id', async (req, res) => {
  try {
    await connectDB()

    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' })
    }
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil produk' })
  }
})

// POST /api/products — tambah produk (admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    await connectDB()

    const { nama, deskripsi, harga, stok, kategori, berat, gambar } = req.body

    const product = await Product.create({
      nama, deskripsi, harga, stok, kategori, berat, gambar
    })

    res.status(201).json({ message: 'Produk berhasil ditambahkan', product })
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah produk' })
  }
})

// PUT /api/products/:id — edit produk (admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await connectDB()

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // kembalikan data yang sudah diupdate
    )
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' })
    }
    res.json({ message: 'Produk berhasil diupdate', product })
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengupdate produk' })
  }
})

// DELETE /api/products/:id — hapus produk (admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await connectDB()
    
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' })
    }
    res.json({ message: 'Produk berhasil dihapus' })
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus produk' })
  }
})

module.exports = router