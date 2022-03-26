import { HttpModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../prisma.service";
import { EmailService } from "./email.service";

@Module({
  imports: [HttpModule, ConfigModule],
  exports: [EmailService],
  providers: [EmailService, PrismaService],
})
export class EmailModule {}
