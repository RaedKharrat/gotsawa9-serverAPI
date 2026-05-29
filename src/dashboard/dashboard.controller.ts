import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('charts')
  getCharts(@Query('days') days?: string) {
    return this.dashboardService.getCharts(days ? Number(days) : 14);
  }

  @Get('overview')
  getOverview(@Query('days') days?: string) {
    return this.dashboardService.getOverview(days ? Number(days) : 14);
  }

  @Get('navigation')
  getNavigation() {
    return this.dashboardService.getNavigation();
  }
}
