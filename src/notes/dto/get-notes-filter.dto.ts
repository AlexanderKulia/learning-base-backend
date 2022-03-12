import { Transform } from "class-transformer";
import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

export class GetNotesFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  perPage?: number;
}
