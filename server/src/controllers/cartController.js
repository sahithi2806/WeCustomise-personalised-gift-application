const { getPrisma } = require('../utils/prisma');
const { formatCartItem, serialiseCustomisation } = require('../utils/serializers');

async function getCart(req, res) {
  const prisma = getPrisma();
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: { include: { category: true } } },
  });

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  res.json({ items: items.map(formatCartItem), total });
}

async function addToCart(req, res) {
  const prisma = getPrisma();
  const { productId, quantity = 1, customisation } = req.body;
  const parsedQuantity = Number(quantity) || 1;
  const normalisedCustomisation = serialiseCustomisation(customisation);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  if (parsedQuantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1.' });
  if (product.stock < parsedQuantity) return res.status(400).json({ error: 'Insufficient stock.' });

  const existingItems = await prisma.cartItem.findMany({
    where: { userId: req.user.id, productId },
  });
  const existing = existingItems.find(
    (item) => JSON.stringify(item.customisation ?? null) === JSON.stringify(normalisedCustomisation)
  );

  let item;
  if (existing) {
    const nextQuantity = existing.quantity + parsedQuantity;
    if (nextQuantity > product.stock) {
      return res.status(400).json({ error: 'Requested quantity exceeds available stock.' });
    }

    item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQuantity },
      include: { product: true },
    });
  } else {
    item = await prisma.cartItem.create({
      data: { userId: req.user.id, productId, quantity: parsedQuantity, customisation: normalisedCustomisation || undefined },
      include: { product: true },
    });
  }

  res.status(201).json({ item: formatCartItem(item), message: 'Added to cart!' });
}

async function updateCartItem(req, res) {
  const prisma = getPrisma();
  const quantity = Number(req.body.quantity);
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { product: true },
  });

  if (!item) return res.status(404).json({ error: 'Cart item not found.' });
  if (!Number.isInteger(quantity)) return res.status(400).json({ error: 'Quantity must be a whole number.' });

  if (quantity < 1) {
    await prisma.cartItem.delete({ where: { id: item.id } });
    return res.json({ message: 'Item removed.' });
  }

  if (quantity > item.product.stock) {
    return res.status(400).json({ error: 'Requested quantity exceeds available stock.' });
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
    include: { product: true },
  });
  res.json({ item: formatCartItem(updatedItem) });
}

async function removeFromCart(req, res) {
  const prisma = getPrisma();
  const item = await prisma.cartItem.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!item) return res.status(404).json({ error: 'Cart item not found.' });

  await prisma.cartItem.delete({ where: { id: item.id } });
  res.json({ message: 'Item removed.' });
}

async function clearCart(req, res) {
  const prisma = getPrisma();
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
  res.json({ message: 'Cart cleared.' });
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
