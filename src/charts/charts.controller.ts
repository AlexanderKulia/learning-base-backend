import { Controller, Get, Logger, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { GetUser } from "../auth/get-user.decorator";
import { ChartsService } from "./charts.service";

@ApiBearerAuth()
@Controller("charts")
@UseGuards(AuthGuard())
export class ChartsController {
  private readonly logger = new Logger(ChartsController.name);

  constructor(private chartsService: ChartsService) {}

  @Get("home")
  getHomeChartData(@GetUser() user: User): Promise<
    {
      day: string;
      count: number;
    }[]
  > {
    this.logger.verbose(`User ${user.email} getting home chart data`);
    return this.chartsService.getHomeChartData(user);
  }
}
