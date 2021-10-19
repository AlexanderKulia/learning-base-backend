import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TagsService } from "./tags.service";
import { TagsRepository } from "./tags.repository";
import { TagsController } from "./tags.controller";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([TagsRepository]), AuthModule],
  providers: [TagsService],
  controllers: [TagsController],
})
export class TagsModule {}
