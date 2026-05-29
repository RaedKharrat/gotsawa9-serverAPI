import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PromocodesService } from './promocodes.service';
import { CreatePromoCodeDto } from './dto/create-promocode.dto';
import { UpdatePromoCodeDto } from './dto/update-promocode.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('promocodes')
export class PromocodesController {
  constructor(private readonly promocodesService: PromocodesService) {}

  // ── Public endpoint (no auth required) ──────────────────────────────────────
  @Post('validate')
  validatePromoCode(@Body() body: { code: string; orderTotal: number }) {
    return this.promocodesService.validatePromoCode(body.code, body.orderTotal);
  }

  // ── Admin endpoints (JWT required) ──────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePromoCodeDto) {
    return this.promocodesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: { page?: string; limit?: string }) {
    return this.promocodesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats() {
    return this.promocodesService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promocodesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePromoCodeDto) {
    return this.promocodesService.update(+id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promocodesService.remove(+id);
  }
}

