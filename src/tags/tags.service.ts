import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TagsRepository } from "./tags.repository";
import { CreateTagDto } from "./dto/create-tag.dto";

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagsRepository) private tagsRepository: TagsRepository,
  ) {}

  createTag(createTagDto: CreateTagDto): Promise<void> {
    return this.tagsRepository.createTag(createTagDto);
  }
}
