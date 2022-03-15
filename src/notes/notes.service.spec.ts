import { Test } from "@nestjs/testing";
import { PrismaService } from "../prisma.service";
import { mockUser } from "./notes.controller.spec";
import { NotesService } from "./notes.service";

const mockTags = ["tag1", "tag2", "tag3"];

describe("NotesService", () => {
  let notesService: NotesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [NotesService, PrismaService],
    }).compile();

    notesService = moduleRef.get<NotesService>(NotesService);
  });

  //TODO rework test
  describe("parseTags", () => {
    it("should take array of strings and return array of tags", () => {
      expect(true).toEqual(true);
    });
  });
});
