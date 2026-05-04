// models/Product.js

const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    trim: true
  },
  deskripsi: {
    type: String,
    required: true
  },
  harga: {
    type: Number,
    required: true
  },
  stok: {
    type: Number,
    required: true,
    default: 0
  },
  kategori: {
    type: String,
    enum: ['arabika', 'robusta', 'campuran', 'lainnya'],
    default: 'lainnya'
  },
  berat: {
    type: String, // contoh: "200g", "500g"
    required: true
  },
  gambar: {
    type: String, // URL gambar produk
    default: ''
  },
  tersedia: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)