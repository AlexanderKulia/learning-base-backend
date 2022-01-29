import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma.service";
import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";

@Module({
  imports: [AuthModule],
  providers: [TagsService, PrismaService, ConfigService],
  controllers: [TagsController],
})
export class TagsModule {}
