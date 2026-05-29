import { Injectable, NotFoundException } from '@nestjs/common';
import {
  buildPaginationMeta,
  isPaginatedRequest,
  parsePagination,
} from '../common/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    const slug = createBrandDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return this.prisma.brand.create({
      data: {
        name: createBrandDto.name,
        slug: `${slug}-${Date.now()}`,
        logoUrl: createBrandDto.logoUrl,
      },
    });
  }

  async findAll(query?: { page?: string; limit?: string; search?: string }) {
    const where: any = {};
    if (query?.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (!query || !isPaginatedRequest(query)) {
      return this.prisma.brand.findMany({ where, orderBy: { name: 'asc' } });
    }

    const { page, limit, skip } = parsePagination(query, 10, 100);
    const [items, total] = await Promise.all([
      this.prisma.brand.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.brand.count({ where }),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async findOne(id: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    let slug;
    const dto = updateBrandDto as any;
    if (dto.name) {
      slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      slug = `${slug}-${Date.now()}`;
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        ...updateBrandDto,
        ...(slug && { slug }),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.brand.delete({
      where: { id },
    });
  }
}
