const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// SUNUCU VERİLERİ (IN-MEMORY DATABASE)
let categories = [
  { id: 1, name: 'Elektronik' },
  { id: 2, name: 'Giyim' },
  { id: 3, name: 'Ev & Yaşam' }
];

let products = [
  { id: 1, title: "Kablosuz Kulaklık", price: 1299, category: "Elektronik", rating: 4.8, stock: 15, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", reviews: [{ author: "Ahmet", comment: "Harika ses kalitesi!" }] },
  { id: 2, title: "Akıllı Saat", price: 2499, category: "Elektronik", rating: 4.6, stock: 8, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", reviews: [] },
  { id: 3, title: "Pamuklu T-Shirt", price: 299, category: "Giyim", rating: 4.3, stock: 25, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500", reviews: [] },
  { id: 4, title: "Kahve Makinesi", price: 3499, category: "Ev & Yaşam", rating: 4.9, stock: 5, image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500", reviews: [] }
];

let orders = [];

// --- API ENDPOINT'LERİ ---

// Kategoriler
app.get('/api/categories', (req, res) => res.json(categories));

app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Kategori adı gerekli" });
  if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    return res.status(400).json({ message: "Bu kategori zaten mevcut!" });
  }
  const newCat = { id: Date.now(), name };
  categories.push(newCat);
  res.status(201).json(newCat);
});

app.delete('/api/categories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  categories = categories.filter(c => c.id !== id);
  res.json({ message: "Kategori silindi" });
});

// Ürünler
app.get('/api/products', (req, res) => res.json(products));

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: Date.now(),
    rating: 5.0,
    reviews: [],
    ...req.body
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  products = products.filter(p => p.id !== id);
  res.json({ message: "Ürün silindi" });
});

// Sipariş ve Ödeme
app.get('/api/orders', (req, res) => res.json(orders));

app.post('/api/checkout', (req, res) => {
  const { customer, address, cart, discount } = req.body;
  
  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: "Sepet boş olamaz" });
  }

  let total = 0;
  cart.forEach(item => {
    const prod = products.find(p => p.id === item.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.qty);
      total += prod.price * item.qty;
    }
  });

  if (discount > 0) total -= total * discount;

  const orderCode = 'TM-' + Math.floor(10000 + Math.random() * 90000);
  const newOrder = {
    code: orderCode,
    customer,
    address,
    amount: total,
    status: "Hazırlanıyor",
    date: new Date().toLocaleDateString('tr-TR')
  };

  orders.push(newOrder);
  res.status(201).json({ success: true, orderCode, total });
});

// Sunucuyu Başlat
app.listen(PORT, () => {
  console.log(`🚀 Trend Market Sunucusu Çalışıyor: http://localhost:${PORT}`);
});