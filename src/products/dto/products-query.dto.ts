import { IsIn, IsOptional, IsString } from 'class-validator';

export class ProductsQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  minPrice?: string;

  @IsOptional()
  @IsString()
  maxPrice?: string;

  @IsOptional()
  @IsIn(['newest', 'oldest', 'price_asc', 'price_desc'])
  sort?: string;

  @IsOptional()
  @IsString()
  inStock?: string;

  @IsOptional()
  @IsString()
  onSale?: string;

  @IsOptional()
  @IsString()
  admin?: string;
}
