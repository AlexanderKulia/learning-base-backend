import { HttpModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma.service";
import { EmailService } from "./email.service";

@Module({
  imports: [HttpModule],
  exports: [EmailService],
  providers: [EmailService, PrismaService, ConfigService],
})
export class EmailModule {}
