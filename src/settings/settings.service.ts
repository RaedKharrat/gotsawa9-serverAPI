import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_SETTINGS, DEFAULT_SETTINGS_MAP } from './settings.defaults';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaults() {
    for (const s of DEFAULT_SETTINGS) {
      await this.prisma.settings.upsert({
        where: { key: s.key },
        update: {
          label: s.label,
          group: s.group,
        },
        create: {
          key: s.key,
          value: s.value,
          label: s.label,
          group: s.group,
        },
      });
    }
  }

  async findAll() {
    await this.ensureDefaults();
    const rows = await this.prisma.settings.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
    const grouped: Record<string, typeof rows> = {};
    for (const row of rows) {
      const g = row.group || 'general';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(row);
    }
    return { items: rows, grouped };
  }

  async upsertMany(settings: Record<string, string>) {
    await this.ensureDefaults();
    const ops = Object.entries(settings).map(([key, value]) => {
      const def = DEFAULT_SETTINGS_MAP[key];
      return this.prisma.settings.upsert({
        where: { key },
        update: {
          value: String(value),
          ...(def && { label: def.label, group: def.group }),
        },
        create: {
          key,
          value: String(value),
          label: def?.label ?? key,
          group: def?.group ?? 'general',
        },
      });
    });
    await Promise.all(ops);
    return this.findAll();
  }

  async getCatalogFilters() {
    await this.ensureDefaults();
    const keys = ['products_per_page', 'default_sort', 'show_out_of_stock', 'low_stock_threshold'];
    const rows = await this.prisma.settings.findMany({ where: { key: { in: keys } } });
    return rows.reduce(
      (acc, r) => {
        acc[r.key] = r.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  async getPublicStoreInfo() {
    await this.ensureDefaults();
    const keys = [
      'store_name',
      'store_tagline_fr',
      'store_tagline_ar',
      'store_email',
      'store_phone',
      'store_address',
      'social_facebook',
      'social_instagram',
      'social_tiktok',
      'social_youtube',
      'social_whatsapp',
      'currency',
    ];
    const rows = await this.prisma.settings.findMany({ where: { key: { in: keys } } });
    const map = rows.reduce(
      (acc, r) => {
        acc[r.key] = r.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    const phone = map.store_phone || '';
    const whatsappRaw = (map.social_whatsapp || '').trim();
    const whatsappUrl =
      whatsappRaw.startsWith('http')
        ? whatsappRaw
        : phone
          ? `https://wa.me/${phone.replace(/\D/g, '')}`
          : '';

    return {
      storeName: map.store_name || 'JdidStore',
      tagline: {
        fr: map.store_tagline_fr || '',
        ar: map.store_tagline_ar || '',
      },
      email: map.store_email || '',
      phone,
      address: map.store_address || '',
      currency: map.currency || 'TND',
      social: {
        facebook: map.social_facebook || '',
        instagram: map.social_instagram || '',
        tiktok: map.social_tiktok || '',
        youtube: map.social_youtube || '',
        whatsapp: whatsappUrl,
      },
    };
  }
}
