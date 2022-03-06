import { IsOptional, IsString } from "class-validator";

export class GetTagsFilterDto {
  @IsOptional()
  @IsString()
  search?: string;
}
