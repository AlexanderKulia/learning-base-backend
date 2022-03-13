import { Prisma } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

enum SortBy {
  id,
  title,
  noteCount,
}

export class GetTagsFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: string;

  @IsOptional()
  @IsEnum(Prisma.SortOrder)
  sortOrder?: Prisma.SortOrder;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  perPage: number;
}
