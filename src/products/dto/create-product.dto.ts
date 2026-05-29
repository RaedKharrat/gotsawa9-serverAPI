import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  @IsObject()
  @IsNotEmpty()
  title!: Record<string, string>;

  @IsObject()
  @IsOptional()
  description?: Record<string, string>;

  @IsNumber()
  @Type(() => Number)
  price!: number;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Type(() => Number)
  discountPrice?: number | null;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsNumber()
  @Type(() => Number)
  categoryId!: number;

  @IsNumber()
  @Type(() => Number)
  brandId!: number;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  images?: string[];

  @IsObject()
  @IsOptional()
  specs?: Record<string, string>;
}
