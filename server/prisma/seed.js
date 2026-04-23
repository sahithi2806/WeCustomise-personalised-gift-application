const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const CUSTOM_COLOR_VALUES = JSON.stringify([
  '#FFFFFF',
  '#101828',
  '#1F4E79',
  '#EC4899',
  '#F97316',
  '#16A34A',
  '#FACC15',
  '#7C3AED',
]);

async function upsertProduct(product) {
  const existing = await prisma.product.findFirst({ where: { name: product.name } });

  if (existing) {
    return prisma.product.update({
      where: { id: existing.id },
      data: product,
    });
  }

  return prisma.product.create({ data: product });
}

async function syncCustomOptions(productId) {
  await prisma.customOption.deleteMany({ where: { productId } });
  await prisma.customOption.createMany({
    data: [
      { productId, type: 'text', label: 'Add Text', values: null },
      { productId, type: 'color', label: 'Base Colour', values: CUSTOM_COLOR_VALUES },
      { productId, type: 'image', label: 'Upload Design', values: null },
    ],
  });
}

async function main() {
  console.log('Seeding database...');

  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'tshirts' }, update: {}, create: { name: 'T-Shirts', slug: 'tshirts', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' } }),
    prisma.category.upsert({ where: { slug: 'mugs' }, update: {}, create: { name: 'Mugs', slug: 'mugs', imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400' } }),
    prisma.category.upsert({ where: { slug: 'phone-cases' }, update: {}, create: { name: 'Phone Cases', slug: 'phone-cases', imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400' } }),
    prisma.category.upsert({ where: { slug: 'hoodies' }, update: {}, create: { name: 'Hoodies', slug: 'hoodies', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400' } }),
    prisma.category.upsert({ where: { slug: 'posters' }, update: {}, create: { name: 'Posters', slug: 'posters', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400' } }),
    prisma.category.upsert({ where: { slug: 'cushions' }, update: {}, create: { name: 'Cushions', slug: 'cushions', imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400' } }),
    prisma.category.upsert({ where: { slug: 'bottles' }, update: {}, create: { name: 'Bottles', slug: 'bottles', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400' } }),
  ]);

  const categoryMap = Object.fromEntries(categories.map((category) => [category.slug, category.id]));

  const products = [
    {
      name: 'Classic Custom T-Shirt',
      description: 'Soft cotton tee with room for text, graphics, and event branding. Great for clubs, gifting, and everyday wear.',
      price: 599,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      isCustomisable: true,
      stock: 150,
      categoryId: categoryMap.tshirts,
    },
    {
      name: 'Oversized Festival Tee',
      description: 'Relaxed fit t-shirt built for standout front graphics, tour prints, and playful gifting.',
      price: 749,
      imageUrl: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=600',
      isCustomisable: true,
      stock: 90,
      categoryId: categoryMap.tshirts,
    },
    {
      name: 'Graphic Tee Minimal',
      description: 'Pre-designed minimalist graphic tee. Not customisable but a consistent bestseller.',
      price: 499,
      imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
      isCustomisable: false,
      stock: 200,
      categoryId: categoryMap.tshirts,
    },
    {
      name: 'Premium Hoodie',
      description: 'Warm fleece-lined hoodie. Add text, artwork, or a matching set design for cooler-weather gifting.',
      price: 1299,
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600',
      isCustomisable: true,
      stock: 80,
      categoryId: categoryMap.hoodies,
    },
    {
      name: 'College Club Hoodie',
      description: 'Heavyweight hoodie ideal for teams, clubs, and reunion designs with bold chest placement.',
      price: 1499,
      imageUrl: 'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=600',
      isCustomisable: true,
      stock: 70,
      categoryId: categoryMap.hoodies,
    },
    {
      name: 'Custom Ceramic Mug',
      description: 'Dishwasher-safe 11oz ceramic mug. Great for names, quotes, inside jokes, and photo gifts.',
      price: 399,
      imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600',
      isCustomisable: true,
      stock: 200,
      categoryId: categoryMap.mugs,
    },
    {
      name: 'Magic Colour-Changing Mug',
      description: 'Heat-sensitive mug that reveals your design when filled with hot liquid.',
      price: 549,
      imageUrl: 'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600',
      isCustomisable: true,
      stock: 60,
      categoryId: categoryMap.mugs,
    },
    {
      name: 'Couple Set Matching Mugs',
      description: 'Two ceramic mugs with a split design that comes together when placed side by side.',
      price: 799,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
      isCustomisable: true,
      stock: 40,
      categoryId: categoryMap.mugs,
    },
    {
      name: 'Office Desk Mug',
      description: 'Matte-finish mug made for office gifting, appreciation messages, and team drops.',
      price: 459,
      imageUrl: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=600',
      isCustomisable: true,
      stock: 95,
      categoryId: categoryMap.mugs,
    },
    {
      name: 'Custom Phone Case',
      description: 'Slim, impact-resistant phone case with room for photos, gradients, and artwork.',
      price: 449,
      imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600',
      isCustomisable: true,
      stock: 120,
      categoryId: categoryMap['phone-cases'],
    },
    {
      name: 'Mirror Edge Phone Case',
      description: 'Glossy case with a stylish reflective border. Add initials or a bold central visual.',
      price: 599,
      imageUrl: 'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=600',
      isCustomisable: true,
      stock: 85,
      categoryId: categoryMap['phone-cases'],
    },
    {
      name: 'Personalised Poster A3',
      description: 'Premium matte poster for memories, room art, event invites, and gallery-style gifts.',
      price: 299,
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
      isCustomisable: true,
      stock: 500,
      categoryId: categoryMap.posters,
    },
    {
      name: 'Spotify Memory Poster',
      description: 'A poster-ready layout inspired by music sharing moments. Add names, colors, and custom text.',
      price: 349,
      imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600',
      isCustomisable: true,
      stock: 220,
      categoryId: categoryMap.posters,
    },
    {
      name: 'Photo Grid Cushion',
      description: 'Soft square cushion designed for collages, anniversary moments, and family gifting.',
      price: 699,
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
      isCustomisable: true,
      stock: 110,
      categoryId: categoryMap.cushions,
    },
    {
      name: 'Quote Cushion Cover',
      description: 'Decor cushion cover for names, short messages, and colorful room accents.',
      price: 549,
      imageUrl: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=600',
      isCustomisable: true,
      stock: 140,
      categoryId: categoryMap.cushions,
    },
    {
      name: 'Sports Water Bottle',
      description: 'Metal bottle ready for gym branding, motivational quotes, and team personalization.',
      price: 649,
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
      isCustomisable: true,
      stock: 130,
      categoryId: categoryMap.bottles,
    },
    {
      name: 'Kids Name Bottle',
      description: 'Bright bottle for school names, icons, and easy grab-and-go personalization.',
      price: 579,
      imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600',
      isCustomisable: true,
      stock: 125,
      categoryId: categoryMap.bottles,
    },
  ];

  for (const product of products) {
    const savedProduct = await upsertProduct(product);

    if (product.isCustomisable) {
      await syncCustomOptions(savedProduct.id);
    }
  }

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@wecustomise.com' },
    update: {},
    create: {
      email: 'admin@wecustomise.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.upsert({
    where: { email: 'demo@wecustomise.com' },
    update: {},
    create: {
      email: 'demo@wecustomise.com',
      password: customerPassword,
      name: 'Demo Customer',
      phone: '9876543210',
      role: 'CUSTOMER',
    },
  });

  await prisma.discount.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: { code: 'WELCOME20', percentage: 20, maxUses: 500, expiresAt: new Date('2026-12-31') },
  });

  await prisma.discount.upsert({
    where: { code: 'FIRST10' },
    update: {},
    create: { code: 'FIRST10', percentage: 10, maxUses: 1000, expiresAt: new Date('2026-12-31') },
  });

  console.log('Database seeded.');
  console.log('Admin: admin@wecustomise.com / admin123');
  console.log('Demo: demo@wecustomise.com / customer123');
  console.log('Discount codes: WELCOME20, FIRST10');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
