import { EntityRepository, Repository } from "typeorm";
import { Tag } from "./tags.entity";
import { CreateTagDto } from "./dto/create-tag.dto";

@EntityRepository(Tag)
export class TagsRepository extends Repository<Tag> {
  async createTag(createTagDto: CreateTagDto): Promise<void> {
    const { title } = createTagDto;

    const tag = this.create({ title });
    await this.save(tag);
  }
}
