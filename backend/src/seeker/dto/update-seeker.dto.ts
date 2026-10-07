import { IsString, IsBoolean, IsNumber, IsDateString, IsArray, IsIn, IsOptional, MinLength } from 'class-validator';

export class UpdateSeekerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @IsBoolean()
  hasApartment?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  budgetMax?: number;

  @IsOptional()
  @IsDateString()
  moveInDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['short', 'long', 'flexible'])
  duration?: string;

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female'])
  genderPreference?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lifestyleTags?: string[];
}
