import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Note, User } from "@prisma/client";
import { GetUser } from "../auth/get-user.decorator";
import { ApiResponse } from "../types";
import { CreateNoteDto } from "./dto/create-note.dto";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";
import { NotesService } from "./notes.service";

@ApiBearerAuth()
@Controller("notes")
@UseGuards(AuthGuard())
export class NotesController {
  private readonly logger = new Logger(NotesController.name);

  constructor(private notesService: NotesService) {}

  @Get()
  getNotes(
    @Query()
    filterDto: GetNotesFilterDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<Note>> {
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
    return this.notesService.getNoteById(id, user);
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
    return this.notesService.deleteNote(id, user);
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
