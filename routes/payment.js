// routes/payment.js — simulasi pembayaran dummy

const express       = require('express')
const router        = express.Router()
const Order         = require('../models/Order')
const { verifyToken } = require('../middleware/auth')

// POST /api/payment/simulate
router.post('/simulate', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: 'Order tidak ditemukan' })
    }

    // Simulasi: 90% sukses, 10% gagal
    const sukses = Math.random() > 0.1

    order.statusPembayaran = sukses ? 'sukses' : 'gagal'
    if (sukses) order.statusOrder = 'diproses'
    await order.save()

    if (sukses) {
      res.json({
        sukses: true,
        message: 'Pembayaran berhasil! Pesanan sedang diproses.',
        orderId:  order._id,
        total:    order.totalHarga
      })
    } else {
      res.status(400).json({
        sukses:  false,
        message: 'Pembayaran gagal. Silakan coba lagi.'
      })
    }
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' })
  }
})

module.exports = router