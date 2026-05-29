import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DEFAULT_SETTINGS } from '../src/settings/settings.defaults';
import {
  buildGeneratedMockProducts,
  CATEGORY_TREE,
  EXTRA_BRANDS,
  MOCK_PRODUCTS,
  productImageUrl,
} from './mock-data';

const prisma = new PrismaClient();

async function seedCategories(): Promise<Map<string, number>> {
  const slugToId = new Map<string, number>();

  for (const parent of CATEGORY_TREE) {
    const parentRow = await prisma.category.upsert({
      where: { slug: parent.slug },
      update: {
        name: parent.name,
        imageUrl: parent.imageUrl ?? null,
        parentId: null,
      },
      create: {
        name: parent.name,
        slug: parent.slug,
        imageUrl: parent.imageUrl ?? null,
        parentId: null,
      },
    });
    slugToId.set(parent.slug, parentRow.id);

    for (const child of parent.children) {
      const childRow = await prisma.category.upsert({
        where: { slug: child.slug },
        update: {
          name: child.name,
          parentId: parentRow.id,
          imageUrl: child.imageUrl ?? parent.imageUrl ?? null,
        },
        create: {
          name: child.name,
          slug: child.slug,
          parentId: parentRow.id,
          imageUrl: child.imageUrl ?? parent.imageUrl ?? null,
        },
      });
      slugToId.set(child.slug, childRow.id);
    }
  }

  return slugToId;
}

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@jdidstore.tn' },
    update: {},
    create: {
      email: 'admin@jdidstore.tn',
      password: hashedPassword,
      name: 'Admin',
    },
  });
  console.log('✅ Admin created: admin@jdidstore.tn / admin123');

  const baseBrands = [
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Apple', slug: 'apple' },
    { name: 'Sony', slug: 'sony' },
    { name: 'Nike', slug: 'nike' },
    { name: 'Adidas', slug: 'adidas' },
    { name: 'LG', slug: 'lg' },
  ];
  const brandSlugToId = new Map<string, number>();
  for (const b of [...baseBrands, ...EXTRA_BRANDS]) {
    const row = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name },
      create: { name: b.name, slug: b.slug },
    });
    brandSlugToId.set(b.slug, row.id);
  }
  console.log(`✅ Brands created (${brandSlugToId.size})`);

  const categorySlugToId = await seedCategories();
  const parentCount = CATEGORY_TREE.length;
  const childCount = CATEGORY_TREE.reduce((n, p) => n + p.children.length, 0);
  console.log(`✅ Categories created: ${parentCount} parents, ${childCount} children (${parentCount + childCount} total)`);

  const getCategoryId = (slug: string) => {
    const id = categorySlugToId.get(slug);
    if (!id) throw new Error(`Category slug not found: ${slug}`);
    return id;
  };

  const getBrandId = (slug: string) => {
    const id = brandSlugToId.get(slug);
    if (!id) throw new Error(`Brand slug not found: ${slug}`);
    return id;
  };

  const legacyProducts = [
    {
      title: { fr: 'Samsung Galaxy S24 Ultra', ar: 'سامسونج جالاكسي S24 ألترا' },
      description: {
        fr: 'Le dernier smartphone Samsung avec S Pen intégré, écran AMOLED 6.8 pouces et caméra 200MP.',
        ar: 'أحدث هاتف سامسونج مع قلم S Pen مدمج وشاشة AMOLED 6.8 بوصة وكاميرا 200 ميجابكسل.',
      },
      price: 4299,
      discountPrice: 3899,
      stock: 25,
      slug: 'samsung-galaxy-s24-ultra',
      categorySlug: 'telephones',
      brandSlug: 'samsung',
      specs: {
        Écran: '6.8" Dynamic AMOLED',
        RAM: '12 GB',
        Stockage: '256 GB',
        Caméra: '200 MP',
        Batterie: '5000 mAh',
      },
    },
    {
      title: { fr: 'iPhone 15 Pro Max', ar: 'آيفون 15 برو ماكس' },
      description: {
        fr: 'iPhone 15 Pro Max avec puce A17 Pro, châssis en titane et caméra périscopique.',
        ar: 'آيفون 15 برو ماكس مع شريحة A17 Pro وهيكل تيتانيوم وكاميرا منظار.',
      },
      price: 5499,
      stock: 15,
      slug: 'iphone-15-pro-max',
      categorySlug: 'telephones',
      brandSlug: 'apple',
      specs: {
        Écran: '6.7" Super Retina XDR',
        Puce: 'A17 Pro',
        Stockage: '256 GB',
        Caméra: '48 MP',
        Batterie: '4422 mAh',
      },
    },
    {
      title: { fr: 'PlayStation 5 Slim', ar: 'بلايستيشن 5 سليم' },
      description: {
        fr: 'La nouvelle PS5 Slim avec lecteur de disque amovible et 1 To de stockage SSD.',
        ar: 'بلايستيشن 5 سليم الجديدة مع قارئ أقراص قابل للإزالة و1 تيرابايت تخزين SSD.',
      },
      price: 1899,
      discountPrice: 1699,
      stock: 30,
      slug: 'ps5-slim',
      categorySlug: 'gaming',
      brandSlug: 'sony',
      specs: { Stockage: '1 TB SSD', Résolution: '4K', FPS: "Jusqu'à 120 fps" },
    },
    {
      title: { fr: 'Nike Air Max 90', ar: 'نايك اير ماكس 90' },
      description: {
        fr: 'Chaussures iconiques Nike Air Max 90, confort et style au quotidien.',
        ar: 'حذاء نايك اير ماكس 90 الأيقوني، راحة وأناقة يومية.',
      },
      price: 389,
      discountPrice: 329,
      stock: 50,
      slug: 'nike-air-max-90',
      categorySlug: 'chaussures',
      brandSlug: 'nike',
      specs: { Matière: 'Cuir synthétique / Mesh', Semelle: 'Air Max', Pointures: '39-46' },
    },
    {
      title: { fr: 'Adidas Ultraboost 23', ar: 'أديداس الترابوست 23' },
      description: {
        fr: 'Running shoes Adidas Ultraboost avec technologie BOOST pour un amorti optimal.',
        ar: 'حذاء أديداس ألترابوست للجري مع تقنية BOOST لتوسيد مثالي.',
      },
      price: 459,
      stock: 40,
      slug: 'adidas-ultraboost-23',
      categorySlug: 'chaussures-sport',
      brandSlug: 'adidas',
      specs: { Technologie: 'BOOST', Semelle: 'Continental', Pointures: '39-45' },
    },
    {
      title: { fr: 'LG Smart TV OLED 55"', ar: 'تلفاز LG OLED ذكي 55 بوصة' },
      description: {
        fr: 'Téléviseur LG OLED 55 pouces avec résolution 4K, webOS et Dolby Atmos.',
        ar: 'تلفاز LG OLED 55 بوصة بدقة 4K ونظام webOS وتقنية Dolby Atmos.',
      },
      price: 3299,
      discountPrice: 2899,
      stock: 10,
      slug: 'lg-oled-55',
      categorySlug: 'tv-video',
      brandSlug: 'lg',
      specs: { Taille: '55"', Résolution: '4K UHD', HDR: 'Dolby Vision', Audio: 'Dolby Atmos' },
    },
    {
      title: { fr: 'Samsung Galaxy Tab S9', ar: 'سامسونج جالاكسي تاب S9' },
      description: {
        fr: 'Tablette Samsung Galaxy Tab S9 avec écran AMOLED 11 pouces et S Pen inclus.',
        ar: 'تابلت سامسونج جالاكسي تاب S9 مع شاشة AMOLED 11 بوصة وقلم S Pen مرفق.',
      },
      price: 2799,
      stock: 20,
      slug: 'samsung-tab-s9',
      categorySlug: 'tablettes',
      brandSlug: 'samsung',
      specs: { Écran: '11" AMOLED', RAM: '8 GB', Stockage: '128 GB', Batterie: '8400 mAh' },
    },
    {
      title: { fr: 'Sony WH-1000XM5', ar: 'سوني WH-1000XM5' },
      description: {
        fr: 'Casque audio sans fil Sony avec réduction de bruit active leader du marché.',
        ar: 'سماعات سوني لاسلكية مع إلغاء ضوضاء نشط رائد في السوق.',
      },
      price: 899,
      discountPrice: 749,
      stock: 35,
      slug: 'sony-wh-1000xm5',
      categorySlug: 'audio-hifi',
      brandSlug: 'sony',
      specs: { Type: 'Over-ear', ANC: 'Oui', Autonomie: '30 heures', Bluetooth: '5.3' },
    },
  ];

  const allProducts = [...legacyProducts, ...MOCK_PRODUCTS, ...buildGeneratedMockProducts()];
  let productsCreated = 0;

  for (const p of allProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    const imageUrl = productImageUrl(p.slug);
    const data = {
      title: p.title,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice ?? null,
      stock: p.stock,
      slug: p.slug,
      categoryId: getCategoryId(p.categorySlug),
      brandId: getBrandId(p.brandSlug),
      specs: p.specs ?? undefined,
      images: {
        create: [{ url: imageUrl, isPrimary: true }],
      },
    };

    if (!existing) {
      await prisma.product.create({ data });
      productsCreated++;
    } else {
      await prisma.product.update({
        where: { slug: p.slug },
        data: {
          title: p.title,
          description: p.description,
          price: p.price,
          discountPrice: p.discountPrice ?? null,
          stock: p.stock,
          categoryId: getCategoryId(p.categorySlug),
          brandId: getBrandId(p.brandSlug),
          specs: p.specs ?? undefined,
        },
      });
    }
  }
  console.log(`✅ Products seeded (${allProducts.length} definitions, ${productsCreated} new)`);

  const promos = [
    { code: 'BIENVENUE10', type: 'PERCENTAGE' as const, value: 10, description: '10% pour nouveaux clients', maxUses: 100 },
    { code: 'FLASH50', type: 'FIXED' as const, value: 50, minOrder: 300, description: '50 TND de réduction', maxUses: 50 },
    { code: 'ETE2026', type: 'PERCENTAGE' as const, value: 15, minOrder: 500, description: 'Soldes été 15%', maxUses: 200 },
  ];
  for (const p of promos) {
    await prisma.promoCode.upsert({
      where: { code: p.code },
      update: {},
      create: {
        ...p,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Promo codes created');

  for (const s of DEFAULT_SETTINGS) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: { label: s.label, group: s.group },
      create: { key: s.key, value: s.value, label: s.label, group: s.group },
    });
  }
  console.log('✅ Store settings created');

  const products = await prisma.product.findMany({ take: 5 });
  if (products.length > 0) {
    const orderCount = await prisma.order.count();
    if (orderCount === 0) {
      const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPING', 'DELIVERED'] as const;
      const names = ['Ahmed Ben Ali', 'Sarra Trabelsi', 'Mohamed Gharbi', 'Fatma Jebali', 'Youssef Hammami'];
      for (let day = 13; day >= 0; day--) {
        const ordersToday = 1 + (day % 3);
        for (let o = 0; o < ordersToday; o++) {
          const product = products[(day + o) % products.length];
          const price = Number(product.discountPrice || product.price);
          const qty = 1 + (o % 2);
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - day);
          createdAt.setHours(10 + o, 30, 0, 0);
          const status = statuses[(day + o) % statuses.length];
          await prisma.order.create({
            data: {
              customerName: names[(day + o) % names.length],
              address: `${10 + day} Rue de la Liberté, Tunis`,
              phone: `+216 2${day} ${100 + o} ${200 + o}`,
              email: `client${day}${o}@example.tn`,
              total: price * qty,
              status,
              createdAt,
              items: {
                create: {
                  productId: product.id,
                  quantity: qty,
                  priceAtTime: price,
                },
              },
            },
          });
        }
      }
      console.log('✅ Demo orders created (14-day chart data)');
    }
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('📧 Admin login: admin@jdidstore.tn');
  console.log('🔑 Admin password: admin123');
  console.log(`📂 Categories: ${parentCount} parents × 10 children = ${childCount} subcategories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
