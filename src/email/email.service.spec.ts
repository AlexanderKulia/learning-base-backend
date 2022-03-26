import { HttpModule } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma.service";
import { EmailService } from "./email.service";

describe("EmailService", () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [EmailService, PrismaService, ConfigService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
