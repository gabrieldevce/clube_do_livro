import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async getVotes() {
    const weekStart = this.getWeekStart();
    const votes = await this.prisma.genreVote.groupBy({
      by: ['genre'],
      where: { weekStart },
      _count: { genre: true },
      _sum: { weight: true },
    });
    return votes
      .map((v) => ({ genre: v.genre, totalVotes: v._sum.weight ?? v._count.genre }))
      .sort((a, b) => b.totalVotes - a.totalVotes);
  }

  async vote(userId: string, genres: string[]) {
    const weekStart = this.getWeekStart();
    await this.prisma.$transaction(
      genres.map((genre) =>
        this.prisma.genreVote.upsert({
          where: { userId_genre_weekStart: { userId, genre, weekStart } },
          create: { userId, genre, weekStart },
          update: { weight: { increment: 1 } },
        }),
      ),
    );
    return this.getVotes();
  }

  private getWeekStart() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
  }
}
