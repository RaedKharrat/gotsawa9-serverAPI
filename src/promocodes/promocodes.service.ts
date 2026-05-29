import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  buildPaginationMeta,
  isPaginatedRequest,
  parsePagination,
} from '../common/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoCodeDto } from './dto/create-promocode.dto';
import { UpdatePromoCodeDto } from './dto/update-promocode.dto';

@Injectable()
export class PromocodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePromoCodeDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.promoCode.findUnique({ where: { code } });
    if (existing) throw new BadRequestException('Ce code promo existe déjà');

    if (dto.type === 'PERCENTAGE' && dto.value > 100) {
      throw new BadRequestException('Le pourcentage ne peut pas dépasser 100');
    }

    const created = await this.prisma.promoCode.create({
      data: {
        code,
        type: dto.type,
        value: dto.value,
        minOrder: dto.minOrder,
        maxUses: dto.maxUses,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isActive: dto.isActive ?? true,
        description: dto.description,
      },
    });
    return this.serializePromo(created);
  }

  private serializePromo<T extends { value: unknown; minOrder?: unknown }>(promo: T) {
    return {
      ...promo,
      value: Number(promo.value),
      minOrder: promo.minOrder != null ? Number(promo.minOrder) : null,
    };
  }

  async findAll(query?: { page?: string; limit?: string }) {
    if (!query || !isPaginatedRequest(query)) {
      const list = await this.prisma.promoCode.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return list.map((p) => this.serializePromo(p));
    }

    const { page, limit, skip } = parsePagination(query, 10, 100);
    const [list, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.promoCode.count(),
    ]);

    return {
      items: list.map((p) => this.serializePromo(p)),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: number) {
    const promo = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException('Code promo introuvable');
    return this.serializePromo(promo);
  }

  async update(id: number, dto: UpdatePromoCodeDto) {
    await this.findOne(id);

    if (dto.type === 'PERCENTAGE' && dto.value !== undefined && dto.value > 100) {
      throw new BadRequestException('Le pourcentage ne peut pas dépasser 100');
    }

    const updated = await this.prisma.promoCode.update({
      where: { id },
      data: {
        ...(dto.code && { code: dto.code.trim().toUpperCase() }),
        ...(dto.type && { type: dto.type }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.minOrder !== undefined && { minOrder: dto.minOrder }),
        ...(dto.maxUses !== undefined && { maxUses: dto.maxUses }),
        ...(dto.startDate !== undefined && {
          startDate: dto.startDate ? new Date(dto.startDate) : null,
        }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
    return this.serializePromo(updated);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.promoCode.delete({ where: { id } });
  }

  async getStats() {
    const [total, active, expired] = await Promise.all([
      this.prisma.promoCode.count(),
      this.prisma.promoCode.count({ where: { isActive: true } }),
      this.prisma.promoCode.count({
        where: {
          endDate: { lt: new Date() },
        },
      }),
    ]);
    return { total, active, expired };
  }

  async validatePromoCode(code: string, orderTotal: number) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!promo) {
      throw new NotFoundException('Code promo invalide');
    }

    if (!promo.isActive) {
      throw new BadRequestException('Ce code promo est inactif');
    }

    const now = new Date();
    if (promo.startDate && now < promo.startDate) {
      throw new BadRequestException("Ce code promo n'est pas encore valide");
    }
    if (promo.endDate && now > promo.endDate) {
      throw new BadRequestException('Ce code promo a expiré');
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('Ce code promo a atteint sa limite d\'utilisation');
    }

    if (promo.minOrder && orderTotal < Number(promo.minOrder)) {
      throw new BadRequestException(`Le montant minimum pour ce code promo est de ${promo.minOrder}`);
    }

    // Calculate discount amount
    const value = Number(promo.value);
    let discountAmount = 0;
    if (promo.type === 'PERCENTAGE') {
      discountAmount = (orderTotal * value) / 100;
    } else {
      discountAmount = value;
    }

    // Discount cannot exceed order total
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    return {
      valid: true,
      code: promo.code,
      type: promo.type,
      value: value,
      discountAmount,
    };
  }
}
