import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Local calendar date YYYY-MM-DD (avoids UTC shift bugs). */
  private toDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private buildDayRange(days: number): { keys: string[]; start: Date; end: Date } {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const keys: string[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      keys.push(this.toDateKey(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return { keys, start, end };
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      publishedProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      categoriesCount,
      brandsCount,
      todayOrders,
      promoCodesActive,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isPublished: true } }),
      this.prisma.product.count({ where: { stock: { lte: 5 }, isPublished: true } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      this.prisma.category.count(),
      this.prisma.brand.count(),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.promoCode.count({ where: { isActive: true } }),
    ]);

    const [revenueAgg, todayRevenueAgg] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: today },
        },
      }),
    ]);

    const avgOrder = totalOrders > 0 ? Number(revenueAgg._sum.total || 0) / totalOrders : 0;

    return {
      totalProducts,
      publishedProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      categoriesCount,
      brandsCount,
      todayOrders,
      promoCodesActive,
      revenue: Number(revenueAgg._sum.total || 0),
      todayRevenue: Number(todayRevenueAgg._sum.total || 0),
      avgOrderValue: Math.round(avgOrder * 100) / 100,
    };
  }

  async getCharts(days = 14) {
    const period = Math.min(90, Math.max(7, Number(days) || 14));
    const { keys, start } = this.buildDayRange(period);

    const bucket: Record<string, { revenue: number; orders: number }> = {};
    for (const key of keys) {
      bucket[key] = { revenue: 0, orders: 0 };
    }

    try {
      const rows = await this.prisma.$queryRaw<
        { day: Date; revenue: unknown; orders: bigint }[]
      >(Prisma.sql`
        SELECT
          DATE("createdAt") AS day,
          COALESCE(SUM(total), 0) AS revenue,
          COUNT(*)::int AS orders
        FROM "Order"
        WHERE "createdAt" >= ${start}
          AND status::text != 'CANCELLED'
        GROUP BY DATE("createdAt")
        ORDER BY day ASC
      `);

      for (const row of rows) {
        const key = this.toDateKey(new Date(row.day));
        if (bucket[key]) {
          bucket[key].revenue = Math.round(Number(row.revenue) * 100) / 100;
          bucket[key].orders = Number(row.orders);
        }
      }
    } catch {
      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: { gte: start },
          status: { not: 'CANCELLED' },
        },
        select: { createdAt: true, total: true },
      });
      for (const order of orders) {
        const key = this.toDateKey(order.createdAt);
        if (bucket[key]) {
          bucket[key].revenue += Number(order.total);
          bucket[key].orders += 1;
        }
      }
      for (const key of keys) {
        bucket[key].revenue = Math.round(bucket[key].revenue * 100) / 100;
      }
    }

    const salesTrend = keys.map((date) => ({
      date: `${date.slice(8, 10)}/${date.slice(5, 7)}`,
      fullDate: date,
      revenue: bucket[date].revenue,
      orders: bucket[date].orders,
    }));

    const statusGroups = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const ordersByStatus = statusGroups.map((g) => ({
      status: g.status,
      count: g._count.id,
      label: this.statusLabel(g.status),
    }));

    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const productIds = topProducts.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, slug: true },
    });

    const topSelling = topProducts.map((tp) => {
      const p = products.find((x) => x.id === tp.productId);
      const title = (p?.title as Record<string, string>)?.fr || 'Produit';
      return {
        productId: tp.productId,
        name: title,
        slug: p?.slug,
        quantity: tp._sum.quantity || 0,
      };
    });

    const totals = salesTrend.reduce(
      (acc, d) => ({ revenue: acc.revenue + d.revenue, orders: acc.orders + d.orders }),
      { revenue: 0, orders: 0 },
    );

    return {
      period,
      salesTrend,
      ordersByStatus,
      topSelling,
      summary: {
        totalRevenue: Math.round(totals.revenue * 100) / 100,
        totalOrders: totals.orders,
        hasActivity: totals.revenue > 0 || totals.orders > 0,
      },
    };
  }

  async getOverview(days = 14) {
    const [stats, charts, recentOrders, alerts] = await Promise.all([
      this.getStats(),
      this.getCharts(days),
      this.getRecentOrders(),
      this.getAlerts(),
    ]);

    return { stats, charts, recentOrders, alerts };
  }

  async getRecentOrders() {
    const orders = await this.prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
        phone: true,
      },
    });
    return orders.map((o) => ({
      ...o,
      total: Number(o.total),
    }));
  }

  async getAlerts() {
    const lowStock = await this.prisma.product.findMany({
      where: { stock: { lte: 5 }, isPublished: true },
      take: 5,
      orderBy: { stock: 'asc' },
      select: { id: true, title: true, stock: true, slug: true },
    });

    const pendingOrders = await this.prisma.order.count({ where: { status: 'PENDING' } });

    const expiringPromos = await this.prisma.promoCode.findMany({
      where: {
        isActive: true,
        endDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
      take: 5,
    });

    return {
      lowStock: lowStock.map((p) => ({
        id: p.id,
        name: (p.title as Record<string, string>)?.fr || 'Produit',
        stock: p.stock,
        slug: p.slug,
      })),
      pendingOrders,
      expiringPromos: expiringPromos.map((p) => ({
        id: p.id,
        code: p.code,
        endDate: p.endDate,
      })),
    };
  }

  getNavigation() {
    return {
      screens: [
        { id: 'dashboard', href: '/admin/dashboard', label: 'Dashboard', group: 'overview' },
        { id: 'orders', href: '/admin/orders', label: 'Commandes', group: 'sales' },
        { id: 'promocodes', href: '/admin/promocodes', label: 'Codes promo', group: 'sales' },
        { id: 'products', href: '/admin/products', label: 'Produits', group: 'catalog' },
        { id: 'categories', href: '/admin/categories', label: 'Catégories', group: 'catalog' },
        { id: 'brands', href: '/admin/brands', label: 'Marques', group: 'catalog' },
        { id: 'settings', href: '/admin/settings', label: 'Paramètres', group: 'system' },
      ],
      relatedByPage: {
        dashboard: ['orders', 'products', 'promocodes', 'settings'],
        orders: ['dashboard', 'promocodes', 'products', 'settings'],
        products: ['categories', 'brands', 'orders', 'settings'],
        categories: ['products', 'brands', 'dashboard'],
        brands: ['products', 'categories', 'dashboard'],
        promocodes: ['orders', 'dashboard', 'settings'],
        settings: ['dashboard', 'products', 'promocodes'],
      },
    };
  }

  private statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      PREPARING: 'Préparation',
      SHIPPING: 'Livraison',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  }
}
