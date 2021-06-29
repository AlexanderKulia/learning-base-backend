import { EntityRepository, Repository } from "typeorm";
import { Note } from "./notes.entity";
import { CreateNoteDto } from "./dto/create-note.dto";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";
import { User } from "../auth/users.entity";

@EntityRepository(Note)
export class NotesRepository extends Repository<Note> {
  async getNotes(filterDto: GetNotesFilterDto, user: User): Promise<Note[]> {
    const { search } = filterDto;

    const query = this.createQueryBuilder("note").where({ user });

    if (search) {
      query.andWhere(
        "(LOWER(note.title) LIKE LOWER(:search) OR LOWER(note.description) LIKE LOWER(:search))",
        { search: `%${search}%` },
      );
    }

    const notes = await query.getMany();
    return notes;
  }

  async createNote(createNoteDto: CreateNoteDto, user: User): Promise<Note> {
    const { title, content } = createNoteDto;

    const note = this.create({
      title,
      content,
      user,
    });

    await this.save(note);
    return note;
  }
}
