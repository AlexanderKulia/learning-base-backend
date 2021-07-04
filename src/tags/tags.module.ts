import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TagsService } from "./tags.service";
import { TagsRepository } from "./tags.repository";

@Module({
  imports: [TypeOrmModule.forFeature([TagsRepository])],
  providers: [TagsService],
})
export class TagsModule {}
