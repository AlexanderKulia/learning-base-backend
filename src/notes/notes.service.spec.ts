import { Test } from "@nestjs/testing";
import { NotesService } from "./notes.service";
import { NotesRepository } from "./notes.repository";
import { User } from "../auth/users.entity";
import { Note } from "./notes.entity";
import { NotFoundException } from "@nestjs/common";

const mockNotesRepository = () => ({
  getNotes: jest.fn(),
  findOne: jest.fn(),
});

const mockUser: User = {
  username: "alex",
  id: 1,
  password: "123",
  notes: [],
};

describe("NotesService", () => {
  let notesService: NotesService;
  let notesRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: NotesRepository, useFactory: mockNotesRepository },
      ],
    }).compile();

    notesService = module.get(NotesService);
    notesRepository = module.get(NotesRepository);
  });

  describe("getNotes", () => {
    it("calls NotesRepository.getNotes and returns the result", async () => {
      notesRepository.getNotes.mockResolvedValue("someValue");
      const result = await notesService.getNotes(null, mockUser);
      expect(result).toEqual("someValue");
    });
  });

  describe("getNoteById", () => {
    it("calls NotesRepository.findOne and returns the result", async () => {
      const mockNote: Partial<Note> = {
        title: "Test title",
        content: "Test content",
        id: 1,
      };

      notesRepository.findOne.mockResolvedValue(mockNote);
      const result = await notesService.getNoteById(1, mockUser);
      expect(result).toEqual(mockNote);
    });

    it("calls NotesRepository.findOne and handles an error", () => {
      notesRepository.findOne.mockResolvedValue(null);
      expect(notesService.getNoteById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
