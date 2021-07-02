import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotesController } from "./notes.controller";
import { NotesRepository } from "./notes.repository";
import { NotesService } from "./notes.service";
import { AuthModule } from "../auth/auth.module";
import { Tag } from "../tags/tags.entity";

@Module({
  imports: [TypeOrmModule.forFeature([NotesRepository, Tag]), AuthModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
