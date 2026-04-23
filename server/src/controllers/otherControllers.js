const { getPrisma } = require('../utils/prisma');

// ── Admin ────────────────────────────────────────────────────────────────────
async function getDashboard(req, res) {
  const prisma = getPrisma();
  const [totalOrders, totalRevenue, totalUsers, totalProducts, recentOrders, topProducts] = await Promise.all([
    prisma.order.count({ where: { paymentStatus: 'SUCCESS' } }),
    prisma.order.aggregate({ where: { paymentStatus: 'SUCCESS' }, _sum: { totalAmount: true } }),
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
  const { status } = req.body;
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
  res.json({ order });
}

async function createProduct(req, res) {
  const prisma = getPrisma();
  const product = await prisma.product.create({ data: req.body, include: { category: true } });
  res.status(201).json({ product });
}

async function updateProduct(req, res) {
  const prisma = getPrisma();
  const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body, include: { category: true } });
  res.json({ product });
}

async function deleteProduct(req, res) {
  const prisma = getPrisma();
  await prisma.product.delete({ where: { id: req.params.id } });
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

  const savings = ((cartTotal || 0) * discount.percentage) / 100;
  res.json({ discount, savings, newTotal: (cartTotal || 0) - savings });
}

// ── Upload ───────────────────────────────────────────────────────────────────
async function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.json({ url: req.file.path, publicId: req.file.filename });
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
