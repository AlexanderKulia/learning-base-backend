import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import supertest from "supertest";
import { mockNote } from "../src/notes/notes.controller.spec";
import { NotesModule } from "../src/notes/notes.module";
import { NotesService } from "../src/notes/notes.service";

describe("NotesController (e2e)", () => {
  let app: INestApplication;
  const notesService = { getNotes: () => [mockNote] };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [NotesModule],
    })
      .overrideProvider(NotesService)
      .useValue(notesService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it("/GET notes", () => {
    return supertest(app.getHttpServer()).get("/notes").expect(401);
  });
});
