import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotesController } from "./notes.controller";
import { NotesRepository } from "./notes.repository";
import { NotesService } from "./notes.service";
import { AuthModule } from "../auth/auth.module";
import { TagsModule } from "src/tags/tags.module";
import { TagsRepository } from "../tags/tags.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([NotesRepository, TagsRepository]),
    AuthModule,
    TagsModule,
  ],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
