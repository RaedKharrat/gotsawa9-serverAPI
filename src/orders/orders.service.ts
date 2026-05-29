import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { buildPaginationMeta, parsePagination } from '../common/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    // 1. Fetch products to get current prices and check stock
    const productIds = createOrderDto.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Some products were not found');
    }

    let total = 0;
    const orderItemsData = createOrderDto.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new BadRequestException('Product not found');
      
      const priceToUse = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
      total += priceToUse * item.quantity;

      // Ensure enough stock
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.title}`);
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: priceToUse,
      };
    });

    // Generate a reference like ORD-XXXXX
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const reference = `ORD-${randomStr}`;

    let finalTotal = total;
    let appliedPromoId: number | null = null;

    if (createOrderDto.promoCode) {
      const promo = await this.prisma.promoCode.findUnique({
        where: { code: createOrderDto.promoCode.trim().toUpperCase() },
      });
      if (
        promo &&
        promo.isActive &&
        (!promo.startDate || new Date() >= promo.startDate) &&
        (!promo.endDate || new Date() <= promo.endDate) &&
        (!promo.maxUses || promo.usedCount < promo.maxUses) &&
        (!promo.minOrder || total >= Number(promo.minOrder))
      ) {
        const value = Number(promo.value);
        let discount = promo.type === 'PERCENTAGE' ? (total * value) / 100 : value;
        if (discount > total) discount = total;
        finalTotal -= discount;
        appliedPromoId = promo.id;
      }
    }

    // 2. Create order and update stock in a transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerName: createOrderDto.customerName,
          address: createOrderDto.address,
          phone: createOrderDto.phone,
          email: createOrderDto.email,
          total: finalTotal,
          reference,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      if (appliedPromoId) {
        await tx.promoCode.update({
          where: { id: appliedPromoId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Update stock for each product
      for (const item of createOrderDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });
  }

  async findAll(query: any) {
    const { page, limit, skip } = parsePagination(query, 10, 100);
    const { status, search } = query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      const term = search.trim();
      where.OR = [
        { reference: { contains: term, mode: 'insensitive' } },
        { customerName: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: {
        status: updateOrderStatusDto.status,
      },
    });
  }

  async trackOrder(reference: string, phone: string) {
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }

    const order = await this.prisma.order.findUnique({
      where: { reference },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const cleanOrderPhone = order.phone.replace(/\s+/g, '');
    const cleanInputPhone = phone.replace(/\s+/g, '');

    if (cleanOrderPhone !== cleanInputPhone) {
      throw new BadRequestException('Phone number does not match this order');
    }

    return order;
  }
}
