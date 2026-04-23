const { getPrisma } = require('../utils/prisma');
const { sendOrderConfirmation } = require('../utils/mailer');
const { formatOrder } = require('../utils/serializers');

const VALID_PAYMENT_METHODS = ['UPI', 'CARD', 'COD'];
const REQUIRED_ADDRESS_FIELDS = ['fullName', 'phone', 'street', 'city', 'state', 'pincode'];

function buildOrderSummary(cartItems, discountAmt) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const totalAmount = Math.max(subtotal + shipping - discountAmt, 0);

  return { subtotal, shipping, totalAmount };
}

async function createOrder(req, res) {
  const prisma = getPrisma();
  const { paymentMethod, address, discountCode, paymentId, giftDelivery } = req.body;

  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method.' });
  }

  if (!address || typeof address !== 'object') {
    return res.status(400).json({ error: 'Delivery address is required.' });
  }

  const missingField = REQUIRED_ADDRESS_FIELDS.find((field) => !String(address[field] || '').trim());
  if (missingField) {
    return res.status(400).json({ error: `Address field "${missingField}" is required.` });
  }

  if (paymentMethod !== 'COD' && !String(paymentId || '').trim()) {
    return res.status(400).json({ error: 'Payment reference is required for online payments.' });
  }

  const isGift = Boolean(giftDelivery?.enabled);
  const recipientName = String(giftDelivery?.recipientName || '').trim();
  const giftMessage = String(giftDelivery?.message || '').trim();
  const scheduledDeliveryAt = giftDelivery?.scheduledDate ? new Date(giftDelivery.scheduledDate) : null;

  if (isGift) {
    if (!recipientName) {
      return res.status(400).json({ error: 'Recipient name is required for a scheduled gift delivery.' });
    }

    if (!scheduledDeliveryAt || Number.isNaN(scheduledDeliveryAt.getTime())) {
      return res.status(400).json({ error: 'Choose a valid scheduled delivery date.' });
    }

    const now = new Date();
    if (scheduledDeliveryAt <= now) {
      return res.status(400).json({ error: 'Scheduled delivery date must be in the future.' });
    }
  }

  // Get cart
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: true },
  });
  if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty.' });

  // Validate stock
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${item.product.name}.` });
    }
  }

  let discountAmt = 0;

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    let discountId = null;

    if (discountCode) {
      const discount = await tx.discount.findFirst({
        where: {
          code: discountCode.toUpperCase(),
          isActive: true,
          expiresAt: { gte: new Date() },
        },
      });

      if (!discount) {
        throw new Error('Invalid or expired discount code.');
      }

      if (discount.usedCount >= discount.maxUses) {
        throw new Error('Discount code has reached its usage limit.');
      }

      const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      discountAmt = (subtotal * discount.percentage) / 100;
      discountId = discount.id;

      await tx.discount.update({
        where: { id: discount.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    const { subtotal, shipping, totalAmount } = buildOrderSummary(cartItems, discountAmt);
    const order = await tx.order.create({
      data: {
        userId: req.user.id,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS',
        paymentId: paymentId || null,
        totalAmount,
        discountAmt,
        discountId,
        address: typeof address === 'string' ? address : JSON.stringify(address),
        isGift,
        recipientName: isGift ? recipientName : null,
        giftMessage: isGift && giftMessage ? giftMessage : null,
        scheduledDeliveryAt: isGift ? scheduledDeliveryAt : null,
        items: {
          create: cartItems.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.product.price,
            customisation: i.customisation,
          })),
        },
      },
      include: { items: { include: { product: true } }, discount: true },
    });

    if (isGift) {
      await tx.giftSchedule.create({
        data: {
          userId: req.user.id,
          occasion: 'Scheduled order delivery',
          scheduledDate: scheduledDeliveryAt,
          message: giftMessage || `Delivery planned for order ${order.id.slice(0, 8).toUpperCase()}`,
          recipientName,
        },
      });
    }

    // Decrement stock
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId: req.user.id } });

    return {
      ...formatOrder(order),
      summary: {
        subtotal,
        shipping,
        discountAmt,
        totalAmount,
      },
    };
  });

  // Send confirmation email (non-blocking)
  sendOrderConfirmation(req.user.email, req.user.name, order).catch(console.error);

  res.status(201).json({ order, message: 'Order placed successfully!' });
}

async function getOrders(req, res) {
  const prisma = getPrisma();
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: { include: { product: { include: { category: true } } } }, discount: true },
    orderBy: { createdAt: 'desc' },
  });

  const withSummary = orders.map((order) => {
    const formattedOrder = formatOrder(order);
    const subtotal = formattedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = Math.max(order.totalAmount + (order.discountAmt || 0) - subtotal, 0);

    return {
      ...formattedOrder,
      summary: {
        subtotal,
        shipping,
        discountAmt: order.discountAmt || 0,
        totalAmount: order.totalAmount,
      },
    };
  });

  res.json({ orders: withSummary });
}

async function getOrder(req, res) {
  const prisma = getPrisma();
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { items: { include: { product: { include: { category: true } } } }, discount: true },
  });
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const formattedOrder = formatOrder(order);
  const subtotal = formattedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = Math.max(order.totalAmount + (order.discountAmt || 0) - subtotal, 0);

  res.json({
    order: {
      ...formattedOrder,
      summary: {
        subtotal,
        shipping,
        discountAmt: order.discountAmt || 0,
        totalAmount: order.totalAmount,
      },
    },
  });
}

async function cancelOrder(req, res) {
  const prisma = getPrisma();
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (!['PLACED', 'PROCESSING'].includes(order.status)) {
    return res.status(400).json({ error: 'Order cannot be cancelled at this stage.' });
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  });

  res.json({ message: 'Order cancelled.' });
}

module.exports = { createOrder, getOrders, getOrder, cancelOrder };
