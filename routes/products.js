// routes/products.js

const express                    = require('express')
const router                     = express.Router()
const Product                    = require('../models/Product')
const { verifyToken, isAdmin }   = require('../middleware/auth')
const connectDB                  = require('../config/db')

// === KONFIGURASI CLOUDINARY & MULTER ===
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'toko-kopi-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  },
});
const upload = multer({ storage: storage });
// =========================================


// GET /api/products — ambil semua produk (publik)
router.get('/', async (req, res) => {
  try {
    await connectDB() 
    
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
// ✅ Tambahkan upload.single('gambar') sebagai middleware
router.post('/', verifyToken, isAdmin, upload.single('gambar'), async (req, res) => {
  try {
    await connectDB()

    const { nama, deskripsi, harga, stok, kategori, berat } = req.body
    // Ambil URL dari cloudinary jika file diupload
    const imageUrl = req.file ? req.file.path : ''

    const product = await Product.create({
      nama, deskripsi, harga, stok, kategori, berat, gambar: imageUrl
    })

    res.status(201).json({ message: 'Produk berhasil ditambahkan', product })
  } catch (err) {
    console.error("Error Detail POST:", err.message || err);
    res.status(500).json({ message: 'Gagal menambah produk' })
  }
})

// PUT /api/products/:id — edit produk (admin)
// ✅ Tambahkan upload.single('gambar') sebagai middleware
router.put('/:id', verifyToken, isAdmin, upload.single('gambar'), async (req, res) => {
  try {
    await connectDB()

    const { nama, deskripsi, harga, stok, kategori, berat, tersedia, gambar } = req.body
    
    // Siapkan data dasar yang PASTI ada
    let updateData = { nama, deskripsi, harga, stok, kategori, berat }
    
    // Hanya masukkan 'tersedia' jika memang dikirim dari Frontend
    if (tersedia !== undefined) {
      updateData.tersedia = tersedia
    }
    
    // Urusan gambar
    if (req.file) {
      updateData.gambar = req.file.path // Gambar baru
    } else if (gambar) {
      updateData.gambar = gambar // Pakai gambar lama
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' })
    }
    res.json({ message: 'Produk berhasil diupdate', product })
  } catch (err) {
    console.error("Error Detail PUT:", err.message || err);
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