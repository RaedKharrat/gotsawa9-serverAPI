import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpsertSettingsDto } from './dto/upsert-settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /** Public — used by storefront catalog */
  @Get('public/catalog')
  getPublicCatalog() {
    return this.settingsService.getCatalogFilters();
  }

  /** Public — contact, social, store info for footer & navbar */
  @Get('public/store')
  getPublicStore() {
    return this.settingsService.getPublicStoreInfo();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('catalog-filters')
  getCatalogFilters() {
    return this.settingsService.getCatalogFilters();
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  upsert(@Body() dto: UpsertSettingsDto) {
    return this.settingsService.upsertMany(dto.settings);
  }
}
