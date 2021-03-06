import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, Tag, User } from "@prisma/client";
import { PrismaService } from "../prisma.service";
import { ApiResponse } from "../types";
import { CreateTagDto } from "./dto/create-tag.dto";
import { GetTagsFilterDto } from "./dto/get-tags-flter.dto";

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(private prisma: PrismaService) {}

  async getTags(
    filterDto: GetTagsFilterDto,
    user: User,
  ): Promise<ApiResponse<Tag>> {
    const { search, page, perPage, sortBy, sortOrder } = filterDto;

    const where: Prisma.TagWhereInput = { user };
    if (search) {
      where.title = { contains: search };
    }

    const orderBy: Prisma.TagOrderByWithRelationInput = {};
    if (!sortBy || !sortOrder) orderBy.updatedAt = "desc";
    if (sortBy === "noteCount") {
      orderBy.notes = { _count: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    try {
      const itemCount = await this.prisma.tag.count({ where });
      const data = await this.prisma.tag.findMany({
        where,
        skip: (page - 1) * perPage,
        orderBy,
        take: perPage,
        include: {
          _count: {
            select: { notes: true },
          },
        },
      });

      return {
        data,
        meta: {
          itemCount,
          pageCount: Math.ceil(itemCount / perPage),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get tags for user "${user.email}". Filters: ${JSON.stringify(
          filterDto,
        )}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getTagById(id: number): Promise<Tag> {
    const found = await this.prisma.tag.findUnique({ where: { id } });

    if (!found) {
      throw new NotFoundException(`Note with ${id} not found`);
    }

    return found;
  }

  async createTag(createTagDto: CreateTagDto, user: User): Promise<Tag> {
    return await this.prisma.tag.create({
      data: { ...createTagDto, user: { connect: { id: user.id } } },
    });
  }

  async deleteTag(id: number): Promise<void> {
    try {
      await this.prisma.tag.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Tag with id ${id} could not be deleted`);
    }
  }

  async updateTag(id: number, updateTagDto: CreateTagDto): Promise<Tag> {
    const { title } = updateTagDto;
    return await this.prisma.tag.update({ where: { id }, data: { title } });
  }
}
