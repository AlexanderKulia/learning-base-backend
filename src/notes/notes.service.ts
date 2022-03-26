import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Note, Prisma, User } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { ApiResponse } from "../types";
import { CreateNoteDto } from "./dto/create-note.dto";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private prisma: PrismaService) {}

  async getNotes(
    filterDto: GetNotesFilterDto,
    user: User,
  ): Promise<ApiResponse<Note>> {
    const { search, tags, page, perPage } = filterDto;
    const where: Prisma.NoteWhereInput = { user };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (tags) {
      where.tags = { some: { title: { in: tags } } };
    }

    try {
      const itemCount = await this.prisma.note.count({ where });
      const data = await this.prisma.note.findMany({
        where,
        include: { tags: true },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { updatedAt: "desc" },
      });

      return {
        data,
        meta: { itemCount, pageCount: Math.ceil(itemCount / perPage) },
      };
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
    const parsedTags = this.parseTags(tags, user);

    return await this.prisma.note.create({
      data: {
        title,
        content,
        user: { connect: { id: user.id } },
        tags: {
          connectOrCreate: parsedTags,
        },
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

  async updateNote(
    id: number,
    updateNoteDto: CreateNoteDto,
    user: User,
  ): Promise<Note> {
    const found = await this.prisma.note.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (user.id !== found?.userId)
      throw new UnauthorizedException(
        `You do not have access to this ressource`,
      );

    const { title, content, tags } = updateNoteDto;

    //Disconnect old tags if present
    const tagsToDisconnect = found.tags.filter(
      (tag) => !tags.includes(tag.title),
    );

    await this.prisma.note.update({
      where: { id },
      data: {
        tags: {
          disconnect: tagsToDisconnect.map((tag) => {
            return { id: tag.id };
          }),
        },
      },
    });

    const parsedTags = this.parseTags(tags, user);

    return await this.prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        tags: { connectOrCreate: parsedTags },
      },
    });
  }

  parseTags(
    tags: string[],
    user: User,
  ): Prisma.Enumerable<Prisma.TagCreateOrConnectWithoutNotesInput> {
    return tags.map((tagTitle) => {
      return {
        where: {
          title_userId: {
            title: tagTitle,
            userId: user.id,
          },
        },
        create: { title: tagTitle, userId: user.id },
      };
    });
  }
}
