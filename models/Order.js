// models/Order.js

const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      produk: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      nama: String,   // snapshot nama saat order
      harga: Number,  // snapshot harga saat order
      jumlah: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  totalHarga: {
    type: Number,
    required: true
  },
  alamat: {
    nama:      String,
    telepon:   String,
    jalan:     String,
    kota:      String,
    kodePos:   String
  },
  statusPembayaran: {
    type: String,
    enum: ['menunggu', 'sukses', 'gagal'],
    default: 'menunggu'
  },
  statusOrder: {
    type: String,
    enum: ['diproses', 'dikirim', 'selesai', 'dibatalkan'],
    default: 'diproses'
  },
  metodePembayaran: {
    type: String,
    default: 'transfer'
  }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)