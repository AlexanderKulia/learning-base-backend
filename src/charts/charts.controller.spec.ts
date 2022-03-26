import { Test, TestingModule } from "@nestjs/testing";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma.service";
import { ChartsController } from "./charts.controller";
import { ChartsService } from "./charts.service";

describe("ChartsController", () => {
  let controller: ChartsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [ChartsController],
      providers: [ChartsService, PrismaService],
    }).compile();

    controller = module.get<ChartsController>(ChartsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
