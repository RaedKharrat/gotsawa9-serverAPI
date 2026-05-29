import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { ProductsQueryDto } from './dto/products-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  private readonly publishedWhere: Prisma.ProductWhereInput = { isPublished: true };

  private normalizeImageUrls(images?: string[]): string[] {
    return (images ?? []).filter(Boolean).slice(0, 5);
  }

  async create(createProductDto: CreateProductDto) {
    const { images, ...productData } = createProductDto;
    const imageUrls = this.normalizeImageUrls(images);

    const slug = (productData.title['fr'] || productData.title['en'] || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
      
    // Generate a reference like PRD-XXXXX
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const reference = `PRD-${randomStr}`;

    return this.prisma.product.create({
      data: {
        ...productData,
        slug: `${slug}-${Date.now()}`,
        reference,
        ...(imageUrls.length > 0 && {
          images: {
            create: imageUrls.map((url, index) => ({
              url,
              isPrimary: index === 0,
            })),
          },
        }),
      },
      include: {
        images: true,
        category: true,
        brand: true,
      },
    });
  }

  async getFilterOptions() {
    const [brands, categories, priceAgg, total, catalogConfig] = await Promise.all([
      this.prisma.brand.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { products: { where: this.publishedWhere } },
          },
        },
      }),
      this.prisma.category.findMany({
        where: { parentId: null },
        orderBy: { id: 'asc' },
        include: {
          _count: {
            select: { products: { where: this.publishedWhere } },
          },
        },
      }),
      this.prisma.product.aggregate({
        where: this.publishedWhere,
        _min: { price: true },
        _max: { price: true },
      }),
      this.prisma.product.count({ where: this.publishedWhere }),
      this.settingsService.getCatalogFilters(),
    ]);

    return {
      catalogConfig,
      brands: brands
        .filter((b) => b._count.products > 0)
        .map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          logoUrl: b.logoUrl,
          productCount: b._count.products,
        })),
      categories: categories
        .filter((c) => c._count.products > 0)
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          imageUrl: c.imageUrl,
          productCount: c._count.products,
        })),
      priceRange: {
        min: Number(priceAgg._min.price ?? 0),
        max: Number(priceAgg._max.price ?? 0),
      },
      totalProducts: total,
      sortOptions: [
        { value: 'newest', label: { fr: 'Plus récents', ar: 'الأحدث' } },
        { value: 'oldest', label: { fr: 'Plus anciens', ar: 'الأقدم' } },
        { value: 'price_asc', label: { fr: 'Prix croissant', ar: 'السعر تصاعدياً' } },
        { value: 'price_desc', label: { fr: 'Prix décroissant', ar: 'السعر تنازلياً' } },
      ],
    };
  }

  async findAll(query: ProductsQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const maxLimit = query.admin === 'true' ? 100 : 48;
    const defaultLimit = query.admin === 'true' ? 10 : 12;
    const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput =
      query.admin === 'true' ? {} : { ...this.publishedWhere };

    if (query.admin !== 'true') {
      const catalog = await this.settingsService.getCatalogFilters();
      if (catalog.show_out_of_stock === 'false' && query.inStock !== 'true') {
        where.stock = { gt: 0 };
      }
    }

    if (query.category) {
      where.categoryId = Number(query.category);
    }

    if (query.brand) {
      const brandStr = String(query.brand);
      if (/^\d+$/.test(brandStr)) {
        where.brandId = Number(brandStr);
      } else {
        where.brand = {
          OR: [
            { slug: { contains: brandStr, mode: 'insensitive' } },
            { name: { contains: brandStr, mode: 'insensitive' } },
          ],
        };
      }
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = Number(query.minPrice);
      if (query.maxPrice) where.price.lte = Number(query.maxPrice);
    }

    if (query.inStock === 'true') {
      where.stock = { gt: 0 };
    }

    if (query.onSale === 'true') {
      where.discountPrice = { not: null };
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { slug: { contains: term, mode: 'insensitive' } },
        { reference: { contains: term, mode: 'insensitive' } },
        { brand: { name: { contains: term, mode: 'insensitive' } } },
      ];
      try {
        const jsonSearch: Prisma.ProductWhereInput[] = [
          { title: { path: ['fr'], string_contains: term } },
          { title: { path: ['ar'], string_contains: term } },
        ];
        where.OR = [...(where.OR as Prisma.ProductWhereInput[]), ...jsonSearch];
      } catch {
        // slug + reference + brand search still apply
      }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (query.sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: true,
          category: true,
          brand: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: { isPublished: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
      },
    });
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        category: true,
        brand: true,
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { images, ...productData } = updateProductDto as UpdateProductDto & {
      images?: string[];
    };

    if (images !== undefined) {
      const imageUrls = this.normalizeImageUrls(images);
      return this.prisma.$transaction(async (tx) => {
        await tx.productImage.deleteMany({ where: { productId: id } });
        return tx.product.update({
          where: { id },
          data: {
            ...productData,
            ...(imageUrls.length > 0 && {
              images: {
                create: imageUrls.map((url, index) => ({
                  url,
                  isPrimary: index === 0,
                })),
              },
            }),
          },
          include: {
            images: true,
            category: true,
            brand: true,
          },
        });
      });
    }

    return this.prisma.product.update({
      where: { id },
      data: productData,
      include: {
        images: true,
        category: true,
        brand: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
