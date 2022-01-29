import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma.service";
import { TagsModule } from "../tags/tags.module";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";

@Module({
  imports: [AuthModule, TagsModule],
  controllers: [NotesController],
  providers: [NotesService, PrismaService, ConfigService],
})
export class NotesModule {}
