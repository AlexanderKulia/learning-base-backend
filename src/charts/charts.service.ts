import { Injectable, Logger } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "../prisma.service";

@Injectable()
export class ChartsService {
  private readonly logger = new Logger(ChartsService.name);

  constructor(private prisma: PrismaService) {}

  async getHomeChartData(
    user: User,
  ): Promise<{ day: string; count: number }[]> {
    const today = new Date();
    const timestamp30daysAgo = new Date(
      new Date().setDate(today.getDate() - 30),
    );

    const last30daysNotes = await this.prisma.$queryRaw<
      { day: string; count: number }[]
    >`SELECT date_trunc('day', "createdAt") AS day, count (id) FROM "Note" WHERE "userId" = ${user.id} AND "createdAt" >= ${timestamp30daysAgo} GROUP BY day ORDER BY day ASC`;
    return last30daysNotes;
  }
}
