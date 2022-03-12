import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class GetTagsFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  perPage: number;
}
