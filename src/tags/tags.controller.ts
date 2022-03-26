import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Tag, User } from "@prisma/client";
import { GetUser } from "../auth/get-user.decorator";
import { ApiResponse } from "../types";
import { CreateTagDto } from "./dto/create-tag.dto";
import { GetTagsFilterDto } from "./dto/get-tags-flter.dto";
import { TagsService } from "./tags.service";

@ApiBearerAuth()
@Controller("tags")
@UseGuards(AuthGuard())
export class TagsController {
  private readonly logger = new Logger(TagsController.name);

  constructor(private tagsService: TagsService) {}

  @Get()
  getTags(
    @Query() filterDto: GetTagsFilterDto,
    @GetUser() user: User,
  ): Promise<ApiResponse<Tag>> {
    this.logger.verbose(
      `User ${user.email} retrieving all tags. Filter: ${JSON.stringify(
        filterDto,
      )}`,
    );
    return this.tagsService.getTags(filterDto, user);
  }

  @Get("/:id")
  getTagById(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Tag> {
    this.logger.verbose(`User ${user.email} getting tagId ${id}`);
    return this.tagsService.getTagById(id);
  }

  @Post()
  createTag(
    @Body() createTagDto: CreateTagDto,
    @GetUser() user: User,
  ): Promise<Tag> {
    this.logger.verbose(
      `User ${user.email} creating a new tag. Data ${JSON.stringify(
        createTagDto,
      )}`,
    );
    return this.tagsService.createTag(createTagDto, user);
  }

  @Delete("/:id")
  deleteNote(
    @Param("id", ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(`User ${user.email} deleting tagId ${id}`);
    return this.tagsService.deleteTag(id);
  }

  @Patch("/:id")
  updateNote(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTagDto: CreateTagDto,
    @GetUser() user: User,
  ): Promise<Tag> {
    this.logger.verbose(`User ${user.email} updating tagId ${id}`);
    return this.tagsService.updateTag(id, updateTagDto);
  }
}
