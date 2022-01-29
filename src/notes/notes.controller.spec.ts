import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { Note, User } from "@prisma/client";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma.service";
import { GetNotesFilterDto } from "./dto/get-notes-filter.dto";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";

export const mockNote: Note = {
  id: 1,
  title: "test",
  content: "test",
  createdAt: null,
  updatedAt: null,
  userId: 1,
};

const mockFilterDto: GetNotesFilterDto = {
  search: "",
};

export const mockUser: User = {
  id: 1,
  email: "",
  password: "",
  tokenVersion: 0,
};

describe("NotesController", () => {
  let notesController: NotesController;
  let notesService: NotesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [NotesController],
      providers: [NotesService, PrismaService, ConfigService],
    }).compile();

    notesService = moduleRef.get<NotesService>(NotesService);
    notesController = moduleRef.get<NotesController>(NotesController);
  });

  describe("getNotes", () => {
    it("should return an array of notes", async () => {
      jest
        .spyOn(notesService, "getNotes")
        .mockImplementation(async () => [mockNote]);

      expect(
        await notesController.getNotes(mockFilterDto, mockUser),
      ).toStrictEqual([mockNote]);
    });
  });
});
