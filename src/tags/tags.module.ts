import { Module } from "@nestjs/common";
import { TagsService } from "./tags.service";
import { TagsController } from "./tags.controller";
import { AuthModule } from "src/auth/auth.module";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  imports: [AuthModule],
  providers: [TagsService, PrismaService],
  controllers: [TagsController],
})
export class TagsModule {}
