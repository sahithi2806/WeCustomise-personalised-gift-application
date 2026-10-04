const { getPrisma } = require('../utils/prisma');

const MAX_LIMIT = 100;

function clampPaging(query) {
  // These come straight from the query string, so a hostile or accidental
  // `?limit=-1` / `?limit=999999` would otherwise reach `skip`/`take` directly.
  const page = Math.max(1, Math.floor(Number(query.page) || 1));
  const requested = Math.floor(Number(query.limit) || 12);
  const limit = Math.min(Math.max(1, requested), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

async function getProducts(req, res) {
  const prisma = getPrisma();
  const { category, search, customisable } = req.query;
  const { page, limit, skip } = clampPaging(req.query);

  const where = {};
  if (category) where.category = { slug: category };
  if (customisable === 'true') where.isCustomisable = true;
  if (search) {
    // SQLite's LIKE is case-insensitive by default, so `contains` alone is
    // correct here. Prisma's `mode: 'insensitive'` is Postgres-only and made
    // SQLite throw PrismaClientValidationError, which broke all search.
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, reviews: { select: { rating: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  const enriched = products.map(p => ({
    ...p,
    avgRating: p.reviews.length ? (p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length).toFixed(1) : null,
    reviewCount: p.reviews.length,
  }));

  res.json({ products: enriched, total, page, limit, pages: Math.ceil(total / limit) });
}

async function getProduct(req, res) {
  const prisma = getPrisma();
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      customOptions: true,
      // Bounded: a popular product could otherwise return every review ever written.
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
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
