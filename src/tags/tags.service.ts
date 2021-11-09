import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateTagDto } from "./dto/create-tag.dto";
import { User, Tag } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async getTags(user: User): Promise<Tag[]> {
    return await this.prisma.tag.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });
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

  async updateTag(id: number, updateTagDto: CreateTagDto) {
    const { title } = updateTagDto;
    return await this.prisma.tag.update({ where: { id }, data: { title } });
  }
}
