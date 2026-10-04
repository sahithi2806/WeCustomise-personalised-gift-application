require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const discountRoutes = require('./routes/discounts');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const giftRoutes = require('./routes/gifts');
const paymentRoutes = require('./routes/payments');
const { authenticate } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests, slow down!' });
app.use('/api', limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts.' });
app.use('/api/auth', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve disk-stored uploads so the URLs handed back by /api/upload are reachable.
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// Serve static client build (deployed together on Render / single-link hosts)
const path = require('path');
app.use(express.static('/opt/render/project/src/client/dist'));

// SPA fallback: serve index.html for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile('/opt/render/project/src/client/dist/index.html');
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', app: 'WeCustomise API', version: '1.0' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gifts', giftRoutes);
// Authenticated: /create-order takes a client-supplied amount, so it must not be
// reachable anonymously. `authenticate` must come BEFORE the router — Express
// runs mounts in order, so putting the router first lets it answer unauthenticated.
app.use('/api/payments', authenticate, paymentRoutes);

// 404
app.use('*', (req, res) => res.status(404).json({ error: `Route ${req.originalUrl} not found` }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 WeCustomise API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
