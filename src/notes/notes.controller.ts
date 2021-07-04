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
import { Note } from "./notes.entity";
import { CreateNoteDto } from "./dto/create-note.dto";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";
import { AuthGuard } from "@nestjs/passport";
import { User } from "../auth/users.entity";
import { GetUser } from "../auth/get-user.decorator";

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
      `User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(
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
    return this.notesService.getNoteById(id, user);
  }

  @Post()
  createNote(
    @Body() createNoteDto: CreateNoteDto,
    @GetUser() user: User,
  ): Promise<Note> {
    this.logger.verbose(
      `User "${user.username} creating a new task. Data ${JSON.stringify(
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
    return this.notesService.deleteNote(id, user);
  }

  @Patch("/:id")
  updateNote(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateNoteDto: CreateNoteDto,
    @GetUser() user: User,
  ): Promise<Note> {
    return this.notesService.updateNote(id, updateNoteDto, user);
  }
}
