import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma.service";
import { TagsModule } from "../tags/tags.module";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";

@Module({
  imports: [AuthModule, TagsModule, ConfigModule],
  controllers: [NotesController],
  providers: [NotesService, PrismaService],
})
export class NotesModule {}
