const { getPrisma } = require('../utils/prisma');

async function getProducts(req, res) {
  const prisma = getPrisma();
  const { category, search, customisable, page = 1, limit = 12 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where = {};
  if (category) where.category = { slug: category };
  if (customisable === 'true') where.isCustomisable = true;
  if (search) where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
  ];

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, reviews: { select: { rating: true } } },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  const enriched = products.map(p => ({
    ...p,
    avgRating: p.reviews.length ? (p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length).toFixed(1) : null,
    reviewCount: p.reviews.length,
  }));

  res.json({ products: enriched, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

async function getProduct(req, res) {
  const prisma = getPrisma();
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      customOptions: true,
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const avgRating = product.reviews.length
    ? (product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  res.json({ product: { ...product, avgRating } });
}

async function getCategories(req, res) {
  const prisma = getPrisma();
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  res.json({ categories });
}

module.exports = { getProducts, getProduct, getCategories };
