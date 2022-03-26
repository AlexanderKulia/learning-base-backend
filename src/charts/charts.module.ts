import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaService } from "../prisma.service";
import { ChartsController } from "./charts.controller";
import { ChartsService } from "./charts.service";

@Module({
  imports: [AuthModule],
  providers: [ChartsService, PrismaService],
  controllers: [ChartsController],
})
export class ChartsModule {}
