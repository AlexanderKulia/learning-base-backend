import {
  Controller,
  Param,
  Get,
  Body,
  Post,
  Delete,
  Patch,
  Query,
} from "@nestjs/common";
import { NotesService } from "./notes.service";
import { Note } from "./notes.entity";
import { CreateNoteDto } from "./dto/create-note.dto";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";

@Controller("notes")
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  getNotes(@Query() filterDto: GetNotesFilterDto): Promise<Note[]> {
    return this.notesService.getNotes(filterDto);
  }

  @Get("/:id")
  getNoteById(@Param("id") id: string): Promise<Note> {
    return this.notesService.getNoteById(id);
  }

  @Post()
  createNote(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
    return this.notesService.createNote(createNoteDto);
  }

  @Delete(":/id")
  deleteNote(@Param("id") id: string): Promise<void> {
    return this.notesService.deleteNote(id);
  }

  @Patch(":/id")
  updateNote(
    @Param("id") id: string,
    @Body() updateNoteDto: CreateNoteDto,
  ): Promise<Note> {
    return this.notesService.updateNote(id, updateNoteDto);
  }
}
