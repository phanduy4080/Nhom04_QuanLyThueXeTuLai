import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class BannerConfigDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  modelType?: 'SKETCHFAB' | 'IMAGE';

  @IsOptional()
  @IsString()
  sketchfabId?: string;

  @IsOptional()
  @IsString()
  sketchfabUrl?: string;

  @IsOptional()
  @IsString()
  fallbackImageUrl?: string;

  @IsOptional()
  @IsString()
  bgImageUrl?: string;

  @IsOptional()
  @IsNumber()
  pricePerDay?: number;

  @IsOptional()
  @IsNumber()
  seats?: number;

  @IsOptional()
  @IsString()
  fuel?: string;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @IsString()
  ctaText?: string;

  @IsOptional()
  @IsString()
  ctaLink?: string;

  @IsOptional()
  @IsBoolean()
  autoRotate?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

