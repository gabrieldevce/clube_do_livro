import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(start?: string, end?: string) {
    const where: { date?: { gte?: Date; lte?: Date } } = {};
    if (start) where.date = { ...where.date, gte: new Date(start) };
    if (end) where.date = { ...where.date, lte: new Date(end) };
    const meetings = await this.prisma.clubMeeting.findMany({
      where,
      orderBy: { date: 'asc' },
    });
    return meetings.map((m) => ({
      id: m.id,
      title: m.title,
      date: m.date.toISOString(),
      type: m.type,
      mediaId: m.mediaId ?? null,
    }));
  }
}
