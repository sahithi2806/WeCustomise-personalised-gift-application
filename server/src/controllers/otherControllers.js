const { getPrisma } = require('../utils/prisma');
const { round2 } = require('../utils/money');
const { z } = require('zod');

const VALID_ORDER_STATUSES = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// Order status can only move forward through the fulfilment flow; DELIVERED and
// CANCELLED are terminal. Prevents a typo or a bad client from resetting a
// shipped order back to PLACED.
const ORDER_STATUS_TRANSITIONS = {
  PLACED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

// Only these fields are writable. Parsing with `.strict()` alone would still let
// a client overwrite `id` or `createdAt`, so we pick explicitly instead.
const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(5000),
  price: z.coerce.number().nonnegative().finite(),
  imageUrl: z.string().trim().url(),
  categoryId: z.string().trim().min(1),
  stock: z.coerce.number().int().nonnegative(),
  isCustomisable: z.coerce.boolean().optional(),
});

const orderStatusSchema = z.object({
  status: z.enum(['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

// ── Admin ────────────────────────────────────────────────────────────────────
async function getDashboard(req, res) {
  const prisma = getPrisma();
  // Paid-but-cancelled orders are still paymentStatus SUCCESS, so they have to be
  // excluded explicitly or they inflate both revenue and the order count.
  const paidActive = { paymentStatus: 'SUCCESS', status: { not: 'CANCELLED' } };

  const [totalOrders, totalRevenue, totalUsers, totalProducts, recentOrders, topProducts] = await Promise.all([
    prisma.order.count({ where: paidActive }),
    prisma.order.aggregate({ where: paidActive, _sum: { totalAmount: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count(),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, email: true } } } }),
    prisma.orderItem.groupBy({ by: ['productId'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 }),
  ]);

  res.json({
    stats: { totalOrders, totalRevenue: totalRevenue._sum.totalAmount || 0, totalUsers, totalProducts },
    recentOrders,
    topProducts,
  });
}

async function getAllOrders(req, res) {
  const prisma = getPrisma();
  const { status, page = 1, limit = 20 } = req.query;
  const where = status ? { status } : {};
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, include: { user: { select: { name: true, email: true } }, items: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: Number(limit) }),
    prisma.order.count({ where }),
  ]);
  res.json({ orders, total });
}

async function updateOrderStatus(req, res) {
  const prisma = getPrisma();
  const { status } = orderStatusSchema.parse(req.body);

  const existing = await prisma.order.findUnique({ where: { id: req.params.id }, select: { id: true, status: true } });
  if (!existing) return res.status(404).json({ error: 'Order not found.' });

  const allowed = ORDER_STATUS_TRANSITIONS[existing.status] || [];
  if (!allowed.includes(status)) {
    return res.status(400).json({
      error: `Cannot change an order from ${existing.status} to ${status}.`,
      allowed,
    });
  }

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status, paymentStatus: status === 'CANCELLED' ? 'CANCELLED' : undefined },
  });
  res.json({ order });
}

async function createProduct(req, res) {
  const prisma = getPrisma();
  const data = productSchema.parse(req.body);
  const product = await prisma.product.create({ data, include: { category: true } });
  res.status(201).json({ product });
}

async function updateProduct(req, res) {
  const prisma = getPrisma();
  const data = productSchema.parse(req.body);
  const product = await prisma.product.update({ where: { id: req.params.id }, data, include: { category: true } });
  res.json({ product });
}

async function deleteProduct(req, res) {
  const prisma = getPrisma();
  const { id } = req.params;

  const product = await prisma.product.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  // OrderItem.productId and Review.productId are ON DELETE RESTRICT (they carry no
  // cascade), so deleting a product that appears in history throws P2003 and
  // surfaces as a 500. Block it and explain, rather than destroying order records.
  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    return res.status(409).json({
      error: `"${product.name}" appears in ${orderCount} past order${orderCount === 1 ? '' : 's'} and cannot be deleted, because that would break order history. Remove it from the catalogue by setting its stock to 0 instead.`,
      code: 'PRODUCT_IN_ORDERS',
      orderCount,
    });
  }

  await prisma.$transaction(async (tx) => {
    // Reviews are also RESTRICT — remove them explicitly first.
    await tx.review.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });
  });

  res.json({ message: 'Product deleted.' });
}

async function getSalesReport(req, res) {
  const prisma = getPrisma();
  const { from, to } = req.query;
  const where = { paymentStatus: 'SUCCESS', createdAt: { gte: new Date(from || '2024-01-01'), lte: new Date(to || new Date()) } };

  const [orders, byStatus, revenue] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.order.aggregate({ where, _sum: { totalAmount: true }, _avg: { totalAmount: true } }),
  ]);

  res.json({ totalOrders: orders, byStatus, revenue: revenue._sum.totalAmount, avgOrderValue: revenue._avg.totalAmount });
}

// ── Reviews ──────────────────────────────────────────────────────────────────
async function submitReview(req, res) {
  const prisma = getPrisma();
  const { productId, rating, comment } = req.body;
  const parsedRating = Number(rating);
  const trimmedComment = String(comment || '').trim();

  if (!productId) return res.status(400).json({ error: 'Product is required.' });
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }
  if (trimmedComment.length < 10) {
    return res.status(400).json({ error: 'Review comment must be at least 10 characters long.' });
  }

  const purchasedItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId: req.user.id,
        status: 'DELIVERED',
      },
    },
  });

  if (!purchasedItem) {
    return res.status(403).json({ error: 'You can review a product only after a delivered purchase.' });
  }

  const review = await prisma.review.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    update: { rating: parsedRating, comment: trimmedComment },
    create: { userId: req.user.id, productId, rating: parsedRating, comment: trimmedComment },
    include: { user: { select: { name: true } } },
  });
  res.status(201).json({ review });
}

// ── Discounts ────────────────────────────────────────────────────────────────
async function validateDiscount(req, res) {
  const prisma = getPrisma();
  const { code, cartTotal } = req.body;

  const discount = await prisma.discount.findFirst({
    where: { code: code.toUpperCase(), isActive: true, expiresAt: { gte: new Date() } },
  });

  if (!discount) return res.status(404).json({ error: 'Invalid or expired discount code.' });
  if (discount.usedCount >= discount.maxUses) return res.status(400).json({ error: 'Discount code has reached its usage limit.' });

  const base = Number(cartTotal) || 0;
  const savings = round2(Math.min((base * discount.percentage) / 100, base));
  res.json({ discount, savings, newTotal: round2(base - savings) });
}

// ── Upload ───────────────────────────────────────────────────────────────────
async function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  if (req.file.secure_url) {
    // Cloudinary hands back an absolute CDN URL.
    return res.json({ url: req.file.secure_url, publicId: req.file.public_id || null });
  }

  // Disk storage gives an absolute filesystem path, which is useless to a
  // browser. Serve it back as the public /uploads path that index.js mounts.
  const filename = req.file.filename;
  if (!filename) return res.status(500).json({ error: 'Could not determine the uploaded file URL.' });

  res.json({ url: `/uploads/${filename}`, publicId: filename });
}

// ── Gifts ────────────────────────────────────────────────────────────────────
async function scheduleGift(req, res) {
  const prisma = getPrisma();
  const {
    occasion,
    scheduledDate,
    message,
    recipientName,
    recipientEmail,
    recipientPhone,
  } = req.body;

  if (!String(occasion || '').trim()) return res.status(400).json({ error: 'Occasion is required.' });
  if (!String(recipientName || '').trim()) return res.status(400).json({ error: 'Recipient name is required.' });
  if (!recipientEmail && !recipientPhone) {
    return res.status(400).json({ error: 'Provide at least a recipient email or phone number.' });
  }

  const parsedDate = new Date(scheduledDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: 'Scheduled date is invalid.' });
  }
  if (parsedDate <= new Date()) {
    return res.status(400).json({ error: 'Scheduled date must be in the future.' });
  }

  const gift = await prisma.giftSchedule.create({
    data: {
      userId: req.user.id,
      occasion: String(occasion).trim(),
      scheduledDate: parsedDate,
      message: String(message || '').trim() || null,
      recipientName: String(recipientName).trim(),
      recipientEmail: String(recipientEmail || '').trim() || null,
      recipientPhone: String(recipientPhone || '').trim() || null,
    },
  });
  res.status(201).json({ gift, message: 'Gift scheduled! We\'ll remind you closer to the date.' });
}

async function getGifts(req, res) {
  const prisma = getPrisma();
  const gifts = await prisma.giftSchedule.findMany({ where: { userId: req.user.id }, orderBy: { scheduledDate: 'asc' } });
  res.json({ gifts });
}

module.exports = {
  getDashboard, getAllOrders, updateOrderStatus, createProduct, updateProduct, deleteProduct, getSalesReport,
  submitReview, validateDiscount, uploadImage, scheduleGift, getGifts,
};
