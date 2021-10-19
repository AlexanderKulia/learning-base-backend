import {
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Body,
  Delete,
  Patch,
} from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { TagsService } from "./tags.service";
import { Tag } from "./tags.entity";
import { User } from "src/auth/users.entity";
import { GetUser } from "src/auth/get-user.decorator";
import { CreateTagDto } from "./dto/create-tag.dto";

@ApiBearerAuth()
@Controller("tags")
@UseGuards(AuthGuard())
export class TagsController {
  private logger = new Logger();
  constructor(private tagsService: TagsService) {}

  @Get()
  getTags(@GetUser() user: User): Promise<Tag[]> {
    this.logger.verbose(`User ${user.email} retrieving all tags`);
    return this.tagsService.getTags(user);
  }

  @Get("/:id")
  getNoteById(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Tag> {
    this.logger.verbose(`User ${user.email} getting tagId ${id}`);
    return this.tagsService.getTagById(id, user);
  }

  @Post()
  createTag(@Body() createTagDto: CreateTagDto, @GetUser() user: User) {
    this.logger.verbose(
      `User ${user.email} creating a new tag. Data ${JSON.stringify(
        createTagDto,
      )}`,
    );
    return this.tagsService.createTag(createTagDto);
  }

  @Delete("/:id")
  deleteNote(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(`User ${user.email} deleting tagId ${id}`);
    return this.tagsService.deleteTag(id, user);
  }

  @Patch("/:id")
  updateNote(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTagDto: CreateTagDto,
    @GetUser() user: User,
  ): Promise<Tag> {
    this.logger.verbose(`User ${user.email} updating tagId ${id}`);
    return this.tagsService.updateTag(id, updateTagDto, user);
  }
}
