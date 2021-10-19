import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Note } from "./notes.entity";
import { NotesRepository } from "./notes.repository";
import { CreateNoteDto } from "./dto/create-note.dto";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";
import { User } from "../auth/users.entity";
import { TagsRepository } from "../tags/tags.repository";
import { Tag } from "src/tags/tags.entity";

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(NotesRepository) private notesRepository: NotesRepository,
    @InjectRepository(TagsRepository) private tagsRepository: NotesRepository,
  ) {}

  getNotes(filterDto: GetNotesFilterDto, user: User): Promise<Note[]> {
    return this.notesRepository.getNotes(filterDto, user);
  }

  async getNoteById(id: number, user: User): Promise<Note> {
    const found = await this.notesRepository.findOne({ id, user });

    if (!found) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }

    return found;
  }

  async createNote(createNoteDto: CreateNoteDto, user: User): Promise<Note> {
    const { title, content, tags } = createNoteDto;

    const note = this.notesRepository.create({
      title,
      content,
      user,
      tags: await this.parseTags(tags, user),
    });

    return this.notesRepository.createNote(note);
  }

  async deleteNote(id: number, user: User): Promise<void> {
    const results = await this.notesRepository.delete({ id, user });

    if (results.affected === 0) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
  }

  async updateNote(id: number, updateNoteDto: CreateNoteDto, user: User) {
    const { title, content, tags } = updateNoteDto;
    const note = await this.getNoteById(id, user);

    note.title = title;
    note.content = content;
    note.tags = await this.parseTags(tags, user);
    await this.notesRepository.save(note);

    return note;
  }

  async parseTags(tags: string[], user: User): Promise<Tag[]> {
    const parsedTags = [];

    for (const tag of tags) {
      const found = await this.tagsRepository.findOne({ title: tag, user });

      found
        ? parsedTags.push(found)
        : parsedTags.push(
            await this.tagsRepository.save(
              this.tagsRepository.create({ title: tag, user }),
            ),
          );
    }
    return parsedTags;
  }
}
