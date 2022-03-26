import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma.service";
import { ChartsService } from "./charts.service";

describe("ChartsService", () => {
  let service: ChartsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartsService, PrismaService],
    }).compile();

    service = module.get<ChartsService>(ChartsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
