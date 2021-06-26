import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Note } from "./notes.entity";
import { NotesRepository } from "./notes.repository";
import { CreateNoteDto } from "./dto/create-note.dto";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(NotesRepository) private notesRepository: NotesRepository,
  ) {}

  getNotes(filterDto: GetNotesFilterDto): Promise<Note[]> {
    return this.notesRepository.getNotes(filterDto);
  }

  async getNoteById(id: string): Promise<Note> {
    const found = await this.notesRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return found;
  }

  createNote(createNoteDto: CreateNoteDto): Promise<Note> {
    return this.notesRepository.createNote(createNoteDto);
  }

  async deleteNote(id: string): Promise<void> {
    const results = await this.notesRepository.delete(id);

    if (results.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async updateNote(id: string, updateNoteDto: CreateNoteDto) {
    const { title, content } = updateNoteDto;
    const note = await this.getNoteById(id);

    note.title = title;
    note.content = content;
    await this.notesRepository.save(note);

    return note;
  }
}
