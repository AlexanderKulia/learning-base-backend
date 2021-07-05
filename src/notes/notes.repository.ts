import { EntityRepository, Repository } from "typeorm";
import { Note } from "./notes.entity";
import { CreateNoteDto } from "./dto/create-note.dto";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";
import { User } from "../auth/users.entity";
import { InternalServerErrorException, Logger } from "@nestjs/common";

@EntityRepository(Note)
export class NotesRepository extends Repository<Note> {
  private logger = new Logger("NotesRepository");

  async getNotes(filterDto: GetNotesFilterDto, user: User): Promise<Note[]> {
    const { search } = filterDto;

    const query = this.createQueryBuilder("note").where({ user });

    if (search) {
      query.andWhere(
        "(LOWER(note.title) LIKE LOWER(:search) OR LOWER(note.description) LIKE LOWER(:search))",
        { search: `%${search}%` },
      );
    }

    query.leftJoinAndSelect("note.tags", "tag");

    try {
      const notes = await query.getMany();
      return notes;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${
          user.email
        }". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createNote(note: Note): Promise<Note> {
    await this.save(note);
    return note;
  }
}
