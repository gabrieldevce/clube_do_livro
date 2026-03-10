import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SeasonsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const seasons = await this.prisma.season.findMany({
      orderBy: { startDate: 'desc' },
    });
    return seasons.map((s) => ({
      id: s.id,
      name: s.name,
      isActive: s.isActive,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      description: s.description,
      theme: s.theme,
    }));
  }
}
