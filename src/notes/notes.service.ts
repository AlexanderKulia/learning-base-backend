import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Note, Tag, User } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { CreateNoteDto } from "./dto/create-note.dto";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private prisma: PrismaService) {}

  async getNotes(filterDto: GetNotesFilterDto, user: User): Promise<Note[]> {
    const { search } = filterDto;

    try {
      return await this.prisma.note.findMany({
        where: {
          user,
          OR: [
            { title: { contains: search } },
            { content: { contains: search } },
          ],
        },
        include: { tags: true },
        orderBy: { updatedAt: "desc" },
      });
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

  async getNoteById(id: number, user: User): Promise<Note> {
    const found = await this.prisma.note.findFirst({
      where: { id, user },
      include: { tags: true },
    });

    if (!found) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }

    return found;
  }

  async createNote(createNoteDto: CreateNoteDto, user: User): Promise<Note> {
    const { title, content, tags } = createNoteDto;
    const parsedTags = await this.parseTags(tags, user);

    return await this.prisma.note.create({
      data: {
        title,
        content,
        user: { connect: { id: user.id } },
        tags: { create: parsedTags },
      },
    });
  }

  async deleteNote(id: number, user: User): Promise<void> {
    try {
      const found = await this.prisma.note.findUnique({ where: { id } });

      if (user.id !== found.userId)
        throw new UnauthorizedException(
          `You do not have access to this ressource`,
        );

      await this.prisma.note.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Could not delete noteId ${id}`);
    }
  }

  async updateNote(id: number, updateNoteDto: CreateNoteDto, user: User) {
    const found = await this.prisma.note.findUnique({ where: { id } });

    if (user.id !== found.userId)
      throw new UnauthorizedException(
        `You do not have access to this ressource`,
      );

    const { title, content, tags } = updateNoteDto;
    const parsedTags = await this.parseTags(tags, user);

    return await this.prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        tags: { connect: parsedTags.map((tag) => ({ id: tag.id })) },
      },
    });
  }

  async parseTags(tags: string[], user: User): Promise<Tag[]> {
    const parsedTags = [];

    for (const tag of tags) {
      const found = await this.prisma.tag.findUnique({
        where: { title_userId: { title: tag, userId: user.id } },
      });

      found
        ? parsedTags.push(found)
        : parsedTags.push(
            await this.prisma.tag.create({
              data: { title: tag, user: { connect: { id: user.id } } },
            }),
          );
    }
    return parsedTags;
  }
}
