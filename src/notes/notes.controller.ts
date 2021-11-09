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
  Logger,
  ParseIntPipe,
} from "@nestjs/common";
import { NotesService } from "./notes.service";
import { CreateNoteDto } from "./dto/create-note.dto";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";
import { AuthGuard } from "@nestjs/passport";
import { User, Note } from "@prisma/client";
import { GetUser } from "../auth/get-user.decorator";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth()
@Controller("notes")
@UseGuards(AuthGuard())
export class NotesController {
  private logger = new Logger();

  constructor(private notesService: NotesService) {}

  @Get()
  getNotes(
    @Query() filterDto: GetNotesFilterDto,
    @GetUser() user: User,
  ): Promise<Note[]> {
    this.logger.verbose(
      `User ${user.email} retrieving all notes. Filters: ${JSON.stringify(
        filterDto,
      )}`,
    );
    return this.notesService.getNotes(filterDto, user);
  }

  @Get("/:id")
  getNoteById(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Note> {
    this.logger.verbose(`User ${user.email} getting noteId ${id}`);
    return this.notesService.getNoteById(id);
  }

  @Post()
  createNote(
    @Body() createNoteDto: CreateNoteDto,
    @GetUser() user: User,
  ): Promise<Note> {
    this.logger.verbose(
      `User ${user.email} creating a new note. Data ${JSON.stringify(
        createNoteDto,
      )}"`,
    );
    return this.notesService.createNote(createNoteDto, user);
  }

  @Delete("/:id")
  deleteNote(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(`User ${user.email} deleting noteId ${id}`);
    return this.notesService.deleteNote(id);
  }

  @Patch("/:id")
  updateNote(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateNoteDto: CreateNoteDto,
    @GetUser() user: User,
  ): Promise<Note> {
    this.logger.verbose(`User ${user.email} updating noteId ${id}`);
    return this.notesService.updateNote(id, updateNoteDto, user);
  }
}
