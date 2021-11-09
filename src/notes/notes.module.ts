import { Module } from "@nestjs/common";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";
import { AuthModule } from "../auth/auth.module";
import { TagsModule } from "src/tags/tags.module";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  imports: [AuthModule, TagsModule],
  controllers: [NotesController],
  providers: [NotesService, PrismaService],
})
export class NotesModule {}
