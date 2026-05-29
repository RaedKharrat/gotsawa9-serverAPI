/** Mock categories (parent + 10 children each) and sample products for seed */

export type LocalizedName = { fr: string; ar: string };

export type CategorySeedNode = {
  slug: string;
  name: LocalizedName;
  imageUrl?: string;
  children: { slug: string; name: LocalizedName; imageUrl?: string }[];
};

const catImg = (slug: string) =>
  `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(slug)}`;

/** 6 parent categories × 10 subcategories each */
export const CATEGORY_TREE: CategorySeedNode[] = [
  {
    slug: 'electronique',
    name: { fr: 'Électronique', ar: 'إلكترونيات' },
    imageUrl: catImg('electronique'),
    children: [
      { slug: 'telephones', name: { fr: 'Téléphones', ar: 'هواتف' } },
      { slug: 'tablettes', name: { fr: 'Tablettes', ar: 'أجهزة لوحية' } },
      { slug: 'ordinateurs-portables', name: { fr: 'Ordinateurs portables', ar: 'حواسيب محمولة' } },
      { slug: 'pc-bureau', name: { fr: 'PC de bureau', ar: 'حواسيب مكتبية' } },
      { slug: 'tv-video', name: { fr: 'TV & Vidéo', ar: 'تلفزيون وفيديو' } },
      { slug: 'audio-hifi', name: { fr: 'Audio & Hi-Fi', ar: 'صوتيات' } },
      { slug: 'photo-camera', name: { fr: 'Photo & Caméras', ar: 'تصوير وكاميرات' } },
      { slug: 'gaming', name: { fr: 'Gaming', ar: 'ألعاب' } },
      { slug: 'accessoires-tech', name: { fr: 'Accessoires tech', ar: 'إكسسوارات تقنية' } },
      { slug: 'montres-connectees', name: { fr: 'Montres connectées', ar: 'ساعات ذكية' } },
    ],
  },
  {
    slug: 'mode',
    name: { fr: 'Mode & Vêtements', ar: 'أزياء وملابس' },
    imageUrl: catImg('mode'),
    children: [
      { slug: 'vetements-homme', name: { fr: 'Vêtements homme', ar: 'ملابس رجالية' } },
      { slug: 'vetements-femme', name: { fr: 'Vêtements femme', ar: 'ملابس نسائية' } },
      { slug: 'vetements-enfant', name: { fr: 'Vêtements enfant', ar: 'ملابس أطفال' } },
      { slug: 'chaussures', name: { fr: 'Chaussures', ar: 'أحذية' } },
      { slug: 'sacs-maroquinerie', name: { fr: 'Sacs & Maroquinerie', ar: 'حقائب وجلود' } },
      { slug: 'bijoux', name: { fr: 'Bijoux', ar: 'مجوهرات' } },
      { slug: 'montres-mode', name: { fr: 'Montres', ar: 'ساعات' } },
      { slug: 'lingerie', name: { fr: 'Lingerie', ar: 'ملابس داخلية' } },
      { slug: 'accessoires-mode', name: { fr: 'Accessoires mode', ar: 'إكسسوارات أزياء' } },
      { slug: 'mariage-soiree', name: { fr: 'Mariage & Soirée', ar: 'أعراس وسهرات' } },
    ],
  },
  {
    slug: 'maison',
    name: { fr: 'Maison & Déco', ar: 'المنزل والديكور' },
    imageUrl: catImg('maison'),
    children: [
      { slug: 'mobilier-salon', name: { fr: 'Mobilier salon', ar: 'أثاث صالة' } },
      { slug: 'mobilier-chambre', name: { fr: 'Mobilier chambre', ar: 'أثاث غرفة نوم' } },
      { slug: 'cuisine-maison', name: { fr: 'Cuisine', ar: 'مطبخ' } },
      { slug: 'salle-de-bain', name: { fr: 'Salle de bain', ar: 'حمام' } },
      { slug: 'jardin-terrasse', name: { fr: 'Jardin & Terrasse', ar: 'حديقة وشرفة' } },
      { slug: 'bricolage-outils', name: { fr: 'Bricolage & Outils', ar: 'أدوات وإصلاحات' } },
      { slug: 'eclairage', name: { fr: 'Éclairage', ar: 'إضاءة' } },
      { slug: 'textile-maison', name: { fr: 'Textile maison', ar: 'منسوجات منزلية' } },
      { slug: 'rangement', name: { fr: 'Rangement', ar: 'تنظيم وتخزين' } },
      { slug: 'petit-electromenager', name: { fr: 'Petit électroménager', ar: 'أجهزة منزلية صغيرة' } },
    ],
  },
  {
    slug: 'beaute',
    name: { fr: 'Beauté & Santé', ar: 'جمال وصحة' },
    imageUrl: catImg('beaute'),
    children: [
      { slug: 'soins-visage', name: { fr: 'Soins visage', ar: 'عناية بالوجه' } },
      { slug: 'soins-corps', name: { fr: 'Soins corps', ar: 'عناية بالجسم' } },
      { slug: 'maquillage', name: { fr: 'Maquillage', ar: 'مكياج' } },
      { slug: 'parfums', name: { fr: 'Parfums', ar: 'عطور' } },
      { slug: 'cheveux', name: { fr: 'Cheveux', ar: 'شعر' } },
      { slug: 'hygiene', name: { fr: 'Hygiène', ar: 'نظافة' } },
      { slug: 'beaute-homme', name: { fr: 'Beauté homme', ar: 'عناية رجالية' } },
      { slug: 'bio-naturel', name: { fr: 'Bio & Naturel', ar: 'طبيعي وعضوي' } },
      { slug: 'accessoires-beaute', name: { fr: 'Accessoires beauté', ar: 'إكسسوارات تجميل' } },
      { slug: 'coffrets-cadeaux', name: { fr: 'Coffrets cadeaux', ar: 'علب هدايا' } },
    ],
  },
  {
    slug: 'sports',
    name: { fr: 'Sports & Loisirs', ar: 'رياضة وترفيه' },
    imageUrl: catImg('sports'),
    children: [
      { slug: 'fitness-musculation', name: { fr: 'Fitness & Musculation', ar: 'لياقة وكمال أجسام' } },
      { slug: 'running', name: { fr: 'Running', ar: 'جري' } },
      { slug: 'football', name: { fr: 'Football', ar: 'كرة قدم' } },
      { slug: 'natation', name: { fr: 'Natation', ar: 'سباحة' } },
      { slug: 'velo', name: { fr: 'Vélo', ar: 'دراجات' } },
      { slug: 'outdoor-camping', name: { fr: 'Outdoor & Camping', ar: 'تخييم وهواء طلق' } },
      { slug: 'nutrition-sportive', name: { fr: 'Nutrition sportive', ar: 'تغذية رياضية' } },
      { slug: 'vetements-sport', name: { fr: 'Vêtements sport', ar: 'ملابس رياضية' } },
      { slug: 'chaussures-sport', name: { fr: 'Chaussures sport', ar: 'أحذية رياضية' } },
      { slug: 'equipement-sport', name: { fr: 'Équipement sport', ar: 'معدات رياضية' } },
    ],
  },
  {
    slug: 'enfants',
    name: { fr: 'Enfants & Bébés', ar: 'أطفال ورضع' },
    imageUrl: catImg('enfants'),
    children: [
      { slug: 'puericulture', name: { fr: 'Puériculture', ar: 'مستلزمات رضع' } },
      { slug: 'jouets-bebe', name: { fr: 'Jouets bébé', ar: 'ألعاب رضع' } },
      { slug: 'jouets-enfant', name: { fr: 'Jouets enfant', ar: 'ألعاب أطفال' } },
      { slug: 'jeux-educatifs', name: { fr: 'Jeux éducatifs', ar: 'ألعاب تعليمية' } },
      { slug: 'poussettes', name: { fr: 'Poussettes', ar: 'عربات أطفال' } },
      { slug: 'chaises-auto', name: { fr: 'Sièges auto', ar: 'مقاعد سيارة للأطفال' } },
      { slug: 'mode-bebe', name: { fr: 'Mode bébé', ar: 'أزياء رضع' } },
      { slug: 'hygiene-bebe', name: { fr: 'Hygiène bébé', ar: 'نظافة رضع' } },
      { slug: 'chambre-enfant', name: { fr: 'Chambre enfant', ar: 'غرفة أطفال' } },
      { slug: 'ecole-fournitures', name: { fr: 'École & Fournitures', ar: 'مدرسة ومستلزمات' } },
    ],
  },
];

export const EXTRA_BRANDS = [
  { name: 'Huawei', slug: 'huawei' },
  { name: 'Xiaomi', slug: 'xiaomi' },
  { name: 'Dell', slug: 'dell' },
  { name: 'HP', slug: 'hp' },
  { name: 'Canon', slug: 'canon' },
  { name: 'Zara', slug: 'zara' },
  { name: 'H&M', slug: 'hm' },
  { name: "L'Oréal", slug: 'loreal' },
  { name: 'Decathlon', slug: 'decathlon' },
  { name: 'Philips', slug: 'philips' },
  { name: 'LEGO', slug: 'lego' },
];

const productImg = (id: number) =>
  `https://via.placeholder.com/600x600.png?text=Produit+${id}`;

/** Extra mock products (categorySlug + brandSlug) */
export const MOCK_PRODUCTS: {
  slug: string;
  title: LocalizedName;
  description: LocalizedName;
  price: number;
  discountPrice?: number;
  stock: number;
  categorySlug: string;
  brandSlug: string;
  specs?: Record<string, string>;
}[] = [
  {
    slug: 'huawei-p60-pro',
    title: { fr: 'Huawei P60 Pro', ar: 'هواوي P60 برو' },
    description: { fr: 'Smartphone Huawei avec caméra Leica et écran OLED.', ar: 'هاتف هواوي بكاميرا لايكا وشاشة OLED.' },
    price: 2899,
    discountPrice: 2599,
    stock: 18,
    categorySlug: 'telephones',
    brandSlug: 'huawei',
  },
  {
    slug: 'xiaomi-14-ultra',
    title: { fr: 'Xiaomi 14 Ultra', ar: 'شاومي 14 ألترا' },
    description: { fr: 'Flagship Xiaomi, capteurs pro et charge rapide 90W.', ar: 'هاتف شاومي الراقي مع شحن سريع 90 واط.' },
    price: 3199,
    stock: 22,
    categorySlug: 'telephones',
    brandSlug: 'xiaomi',
  },
  {
    slug: 'dell-xps-15',
    title: { fr: 'Dell XPS 15', ar: 'ديل XPS 15' },
    description: { fr: 'Ultrabook premium Intel Core i7, écran 3.5K OLED.', ar: 'حاسوب محمول فاخر بشاشة OLED 3.5K.' },
    price: 5999,
    discountPrice: 5499,
    stock: 8,
    categorySlug: 'ordinateurs-portables',
    brandSlug: 'dell',
  },
  {
    slug: 'hp-pavilion-27',
    title: { fr: 'HP Pavilion 27', ar: 'إتش بي بافيليون 27' },
    description: { fr: 'PC tout-en-un 27 pouces pour bureau et famille.', ar: 'حاسوب الكل في واحد 27 بوصة للعائلة.' },
    price: 2499,
    stock: 12,
    categorySlug: 'pc-bureau',
    brandSlug: 'hp',
  },
  {
    slug: 'canon-eos-r8',
    title: { fr: 'Canon EOS R8', ar: 'كانون EOS R8' },
    description: { fr: 'Appareil photo hybride full-frame léger.', ar: 'كاميرا هجينة فول فريم خفيفة.' },
    price: 4599,
    stock: 6,
    categorySlug: 'photo-camera',
    brandSlug: 'canon',
  },
  {
    slug: 'zara-blazer-homme',
    title: { fr: 'Blazer slim homme Zara', ar: 'سترة زارا رجالية سليم' },
    description: { fr: 'Blazer élégant coupe slim, polyester recyclé.', ar: 'سترة أنيقة بقصة ضيقة.' },
    price: 299,
    discountPrice: 249,
    stock: 45,
    categorySlug: 'vetements-homme',
    brandSlug: 'zara',
  },
  {
    slug: 'hm-robe-ete',
    title: { fr: 'Robe d’été H&M', ar: 'فستان صيفي H&M' },
    description: { fr: 'Robe fluide coton bio, plusieurs coloris.', ar: 'فستان قطني خفيف بعدة ألوان.' },
    price: 129,
    stock: 60,
    categorySlug: 'vetements-femme',
    brandSlug: 'hm',
  },
  {
    slug: 'philips-airfryer-xxl',
    title: { fr: 'Philips Airfryer XXL', ar: 'فيليبس مقلاة هوائية XXL' },
    description: { fr: 'Friteuse sans huile 6.2 L, technologie Rapid Air.', ar: 'قلاية هوائية 6.2 لتر بدون زيت.' },
    price: 699,
    discountPrice: 599,
    stock: 25,
    categorySlug: 'petit-electromenager',
    brandSlug: 'philips',
  },
  {
    slug: 'loreal-serum-revitalift',
    title: { fr: 'Sérum Revitalift L’Oréal', ar: 'سيروم لوريال ريفيتاليفت' },
    description: { fr: 'Sérum anti-âge à l’acide hyaluronique, 30 ml.', ar: 'سيروم مضاد للشيخوخة بحمض الهيالورونيك.' },
    price: 89,
    stock: 80,
    categorySlug: 'soins-visage',
    brandSlug: 'loreal',
  },
  {
    slug: 'decathlon-tapis-yoga',
    title: { fr: 'Tapis de yoga Decathlon', ar: 'سجادة يوجا ديكاتلون' },
    description: { fr: 'Tapis antidérapant 5 mm, confortable et durable.', ar: 'سجادة يوجا مضادة للانزلاق 5 مم.' },
    price: 49,
    stock: 100,
    categorySlug: 'fitness-musculation',
    brandSlug: 'decathlon',
  },
  {
    slug: 'lego-city-police',
    title: { fr: 'LEGO City Commissariat', ar: 'ليغو سيتي مركز شرطة' },
    description: { fr: 'Set de construction 743 pièces, dès 6 ans.', ar: 'مجموعة بناء 743 قطعة من عمر 6.' },
    price: 199,
    discountPrice: 169,
    stock: 35,
    categorySlug: 'jouets-enfant',
    brandSlug: 'lego',
    specs: { Pièces: '743', Âge: '6+' },
  },
  {
    slug: 'samsung-galaxy-watch-6',
    title: { fr: 'Samsung Galaxy Watch 6', ar: 'ساعة سامسونج جالاكسي 6' },
    description: { fr: 'Montre connectée suivi santé et notifications.', ar: 'ساعة ذكية لتتبع الصحة والإشعارات.' },
    price: 899,
    stock: 28,
    categorySlug: 'montres-connectees',
    brandSlug: 'samsung',
  },
];

/** Auto-generated mock products (one per leaf category not covered above) */
export function buildGeneratedMockProducts(): typeof MOCK_PRODUCTS {
  const usedSlugs = new Set(MOCK_PRODUCTS.map((p) => p.slug));
  const brandSlugs = ['samsung', 'apple', 'sony', 'nike', 'adidas', 'lg', 'huawei', 'xiaomi', 'philips', 'decathlon'];
  const items: typeof MOCK_PRODUCTS = [];
  let idx = 1;

  for (const parent of CATEGORY_TREE) {
    for (const child of parent.children) {
      const slug = `demo-${child.slug}`;
      if (usedSlugs.has(slug)) continue;
      usedSlugs.add(slug);
      const price = 29 + (idx % 20) * 17;
      items.push({
        slug,
        title: {
          fr: `Produit démo — ${child.name.fr}`,
          ar: `منتج تجريبي — ${child.name.ar}`,
        },
        description: {
          fr: `Article de démonstration pour la catégorie ${child.name.fr}.`,
          ar: `منتج تجريبي لفئة ${child.name.ar}.`,
        },
        price,
        discountPrice: idx % 3 === 0 ? Math.round(price * 0.85) : undefined,
        stock: 10 + (idx % 40),
        categorySlug: child.slug,
        brandSlug: brandSlugs[idx % brandSlugs.length],
        specs: { Référence: `DEMO-${idx}`, Catégorie: child.slug },
      });
      idx++;
    }
  }
  return items;
}

export function productImageUrl(seed: string): string {
  return productImg(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 1000);
}
