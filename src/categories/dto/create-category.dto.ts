import { IsNotEmpty, IsObject, IsOptional, IsString, IsNumber, ValidateIf } from 'class-validator';

export class CreateCategoryDto {
  @IsObject()
  @IsNotEmpty()
  name!: Record<string, string>;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ValidateIf((object, value) => value !== null)
  @IsNumber()
  @IsOptional()
  parentId?: number | null;
}
