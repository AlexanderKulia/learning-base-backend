import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TagsRepository } from "./tags.repository";
import { CreateTagDto } from "./dto/create-tag.dto";
import { User } from "src/auth/users.entity";
import { Tag } from "./tags.entity";

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagsRepository) private tagsRepository: TagsRepository,
  ) {}

  async getTags(user: User): Promise<Tag[]> {
    return this.tagsRepository.find({ user });
  }

  async getTagById(id: number, user: User): Promise<Tag> {
    const found = await this.tagsRepository.findOne({ id, user });

    if (!found) {
      throw new NotFoundException(`Note with ${id} not found`);
    }

    return found;
  }

  async createTag(createTagDto: CreateTagDto): Promise<void> {
    return this.tagsRepository.createTag(createTagDto);
  }

  async deleteTag(id: number, user: User): Promise<void> {
    const results = await this.tagsRepository.delete({ id, user });

    if (results.affected === 0) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }
  }

  async updateTag(id: number, updateTagDto: CreateTagDto, user: User) {
    const { title } = updateTagDto;
    const tag = await this.getTagById(id, user);

    tag.title = title;
    await this.tagsRepository.save(tag);

    return tag;
  }
}
