const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'tshirts' }, update: {}, create: { name: 'T-Shirts', slug: 'tshirts', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' } }),
    prisma.category.upsert({ where: { slug: 'mugs' }, update: {}, create: { name: 'Mugs', slug: 'mugs', imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400' } }),
    prisma.category.upsert({ where: { slug: 'phone-cases' }, update: {}, create: { name: 'Phone Cases', slug: 'phone-cases', imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400' } }),
    prisma.category.upsert({ where: { slug: 'hoodies' }, update: {}, create: { name: 'Hoodies', slug: 'hoodies', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400' } }),
    prisma.category.upsert({ where: { slug: 'posters' }, update: {}, create: { name: 'Posters', slug: 'posters', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400' } }),
  ]);

  const [tshirts, mugs, phoneCases, hoodies, posters] = categories;

  // Products
  const products = [
    {
      name: 'Classic Custom T-Shirt',
      description: 'High-quality 100% cotton t-shirt. Add your text, choose your colour, or upload your design. Perfect for events, gifts, or everyday wear.',
      price: 599,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      isCustomisable: true,
      stock: 150,
      categoryId: tshirts.id,
    },
    {
      name: 'Premium Hoodie',
      description: 'Warm fleece-lined hoodie. Customise with your artwork or text. Available in multiple colour bases.',
      price: 1299,
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600',
      isCustomisable: true,
      stock: 80,
      categoryId: hoodies.id,
    },
    {
      name: 'Custom Ceramic Mug',
      description: 'Dishwasher-safe 11oz ceramic mug. Print your photo, quote, or design. Great for gifting.',
      price: 399,
      imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600',
      isCustomisable: true,
      stock: 200,
      categoryId: mugs.id,
    },
    {
      name: 'Magic Colour-Changing Mug',
      description: 'Heat-sensitive mug that reveals your design when filled with hot liquid. The ultimate surprise gift.',
      price: 549,
      imageUrl: 'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600',
      isCustomisable: true,
      stock: 60,
      categoryId: mugs.id,
    },
    {
      name: 'Custom Phone Case',
      description: 'Slim, impact-resistant phone case. Upload your photo or design. Compatible with most iPhone and Android models.',
      price: 449,
      imageUrl: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600',
      isCustomisable: true,
      stock: 120,
      categoryId: phoneCases.id,
    },
    {
      name: 'Personalised Poster (A3)',
      description: 'High-resolution A3 print on premium matte paper. Upload your design or let us print your favourite memory.',
      price: 299,
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
      isCustomisable: true,
      stock: 500,
      categoryId: posters.id,
    },
    {
      name: 'Graphic Tee — Minimal',
      description: 'Pre-designed minimalist graphic tee. Not customisable but a bestseller. Soft, breathable cotton.',
      price: 499,
      imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',
      isCustomisable: false,
      stock: 200,
      categoryId: tshirts.id,
    },
    {
      name: 'Couple Set — Matching Mugs',
      description: 'Two ceramic mugs with a matching design split across them. Perfect anniversary or Valentine\'s gift.',
      price: 799,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
      isCustomisable: true,
      stock: 40,
      categoryId: mugs.id,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { id: product.name }, // won't match, will always create (fine for seed)
      update: {},
      create: product,
    }).catch(() => prisma.product.create({ data: product }));

    // Add custom options for customisable products
    if (product.isCustomisable) {
      const options = [
        { productId: created.id, type: 'text', label: 'Add Text', values: null },
        { productId: created.id, type: 'color', label: 'Base Colour', values: JSON.stringify(['#FFFFFF', '#000000', '#1F4E79', '#C0392B', '#27AE60', '#F39C12', '#8E44AD', '#2C3E50']) },
        { productId: created.id, type: 'image', label: 'Upload Design', values: null },
      ];
      for (const opt of options) {
        await prisma.customOption.upsert({
          where: { id: opt.productId + opt.type },
          update: {},
          create: opt,
        }).catch(() => { });
      }
    }
  }

  // Admin user
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

  // Demo customer
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

  // Discount codes
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

  console.log('✅ Database seeded!');
  console.log('   Admin: admin@wecustomise.com / admin123');
  console.log('   Demo:  demo@wecustomise.com  / customer123');
  console.log('   Discount codes: WELCOME20, FIRST10');
}

main().catch(console.error).finally(() => prisma.$disconnect());
