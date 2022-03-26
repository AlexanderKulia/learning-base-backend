import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma.service";
import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";

@Module({
  imports: [AuthModule, ConfigModule],
  providers: [TagsService, PrismaService],
  controllers: [TagsController],
})
export class TagsModule {}
