import { Injectable, NotFoundException } from '@nestjs/common';
import {
  buildPaginationMeta,
  isPaginatedRequest,
  parsePagination,
} from '../common/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = (createCategoryDto.name['fr'] || createCategoryDto.name['en'] || 'category')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug: `${slug}-${Date.now()}`,
        imageUrl: createCategoryDto.imageUrl,
        parentId: createCategoryDto.parentId,
      },
    });
  }

  async findAll(query?: { page?: string; limit?: string; admin?: string; search?: string }) {
    const isAdmin = query?.admin === 'true';
    const where: any = isAdmin ? {} : { parentId: null };

    if (query?.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { slug: { contains: term, mode: 'insensitive' } },
      ];
      try {
        const jsonSearch = [
          { name: { path: ['fr'], string_contains: term } },
          { name: { path: ['ar'], string_contains: term } },
        ];
        where.OR = [...where.OR, ...jsonSearch];
      } catch {
        // Fallback for non-JSON db fields, though prisma json path is usually supported
      }
    }

    if (!query || !isPaginatedRequest(query)) {
      return this.prisma.category.findMany({
        include: { children: true },
        where,
        orderBy: { id: 'asc' },
      });
    }

    const { page, limit, skip } = parsePagination(query, 10, 100);
    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        ...(isAdmin ? {} : { include: { children: true } }),
      }),
      this.prisma.category.count({ where }),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    let slug;
    const dto = updateCategoryDto as any;
    if (dto.name) {
      slug = (dto.name['fr'] || dto.name['en'] || 'category')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      slug = `${slug}-${Date.now()}`;
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        ...(slug && { slug }),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
