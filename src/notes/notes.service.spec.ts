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

  describe("parseTags", () => {
    it("should take in array of strings and return array of tags", async () => {
      const res = [
        { id: 1, title: "tag1", userId: 1 },
        { id: 2, title: "tag2", userId: 1 },
        { id: 3, title: "tag3", userId: 1 },
      ];

      jest.spyOn(notesService, "parseTags").mockImplementation(async () => res);

      expect(await notesService.parseTags(mockTags, mockUser)).toEqual(res);
    });
  });
});
