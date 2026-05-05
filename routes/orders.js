// routes/orders.js

const express                  = require('express')
const router                   = express.Router()
const Order                    = require('../models/Order')
const Product                  = require('../models/Product')
const { verifyToken, isAdmin } = require('../middleware/auth')

// POST /api/orders — buat order baru (harus login)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, alamat, metodePembayaran } = req.body

    // Validasi items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items tidak boleh kosong' })
      }
      for (const item of items) {
        if (!Number.isInteger(item.jumlah) || item.jumlah < 1 || item.jumlah > 100) {
          return res.status(400).json({ message: 'Jumlah item harus antara 1-100' })
        }
      }

      // Validasi alamat
      if (!alamat || typeof alamat !== 'object') {
        return res.status(400).json({ message: 'Alamat tidak valid' })
      }
      if (!alamat.nama || !alamat.jalan || !alamat.kota) {
        return res.status(400).json({ message: 'Alamat harus mengisi nama, jalan, dan kota' })
      }

    let totalHarga = 0
    // ✅ Sesudah — dua tahap: validasi dulu, baru kurangi
// TAHAP 1: Ambil & validasi semua produk, jangan ubah stok dulu
    const produkList = await Promise.all(
      items.map(async (item) => {
        const produk = await Product.findById(item.produkId)
        if (!produk) throw new Error(`Produk tidak ditemukan`)
        if (produk.stok < item.jumlah) {
          throw new Error(`Stok untuk ${produk.nama} tidak mencukupi`)
        }
        return { produk, item }
      })
    )

    // Kalau sampai sini berarti semua produk valid, aman untuk lanjut

    // TAHAP 2: Hitung total & kurangi stok semua sekaligus
    const itemsLengkap = []
    for (const { produk, item } of produkList) {
      totalHarga += produk.harga * item.jumlah
      produk.stok -= item.jumlah
      await produk.save()
      itemsLengkap.push({
        produk: produk._id,
        nama:   produk.nama,
        harga:  produk.harga,
        jumlah: item.jumlah
      })
    }

    const order = await Order.create({
      user:             req.user.id,
      items:            itemsLengkap,
      totalHarga,
      alamat,
      metodePembayaran: metodePembayaran || 'transfer'
    })

    res.status(201).json({ message: 'Order berhasil dibuat & stok diperbarui', order })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Gagal membuat order' })
  }
})

// GET /api/orders/saya — order milik user sendiri
router.get('/saya', verifyToken, async (req, res) => {
  try {
    const orders = await Order
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil order' })
  }
})

// GET /api/orders — semua order (admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order
      .find()
      .populate('user', 'nama email')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil order' })
  }
})

// PUT /api/orders/:id/status — update status order (admin)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { statusOrder } = req.body
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { statusOrder },
      { new: true }
    )
    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' })
    }
    res.json({ message: 'Status order diupdate', order })
  } catch (err) {
    res.status(500).json({ message: 'Gagal update status' })
  }
})


module.exports = router