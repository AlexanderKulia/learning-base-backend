import {
  Controller,
  Param,
  Get,
  Body,
  Post,
  Delete,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { NotesService } from "./notes.service";
import { Note } from "./notes.entity";
import { CreateNoteDto } from "./dto/create-note.dto";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";
import { AuthGuard } from "@nestjs/passport";
import { User } from "../auth/users.entity";
import { GetUser } from "src/auth/get-user.decorator";

@Controller("notes")
@UseGuards(AuthGuard())
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  getNotes(
    @Query() filterDto: GetNotesFilterDto,
    @GetUser() user: User,
  ): Promise<Note[]> {
    return this.notesService.getNotes(filterDto, user);
  }

  @Get("/:id")
  getNoteById(@Param("id") id: string, @GetUser() user: User): Promise<Note> {
    return this.notesService.getNoteById(id, user);
  }

  @Post()
  createNote(
    @Body() createNoteDto: CreateNoteDto,
    @GetUser() user: User,
  ): Promise<Note> {
    return this.notesService.createNote(createNoteDto, user);
  }

  @Delete("/:id")
  deleteNote(@Param("id") id: string, @GetUser() user: User): Promise<void> {
    return this.notesService.deleteNote(id, user);
  }

  @Patch("/:id")
  updateNote(
    @Param("id") id: string,
    @Body() updateNoteDto: CreateNoteDto,
    @GetUser() user: User,
  ): Promise<Note> {
    return this.notesService.updateNote(id, updateNoteDto, user);
  }
}
