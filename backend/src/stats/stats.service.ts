import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [mediaWithReviews, users, genreVotes] = await Promise.all([
      this.prisma.review.groupBy({
        by: ['mediaId'],
        _avg: { rating: true },
        _count: true,
      }),
      this.prisma.user.findMany({
        orderBy: { points: 'desc' },
        take: 10,
        include: { userBadges: { include: { badge: true } } },
      }),
      this.prisma.genreVote.groupBy({
        by: ['genre'],
        _count: true,
      }),
    ]);

    const mediaIds = mediaWithReviews.map((r) => r.mediaId);
    const mediaList = mediaIds.length
      ? await this.prisma.media.findMany({
          where: { id: { in: mediaIds } },
        })
      : [];
    const mediaMap = new Map(mediaList.map((m) => [m.id, m]));
    const topRated = mediaWithReviews
      .map((r) => ({
        media: mediaMap.get(r.mediaId),
        avg: r._avg.rating ?? 0,
        count: r._count,
      }))
      .filter((x) => x.media)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10)
      .map((x) => ({
        ...this.toMediaDto(x.media!),
        _count: { reviews: x.count },
      }));

    const topGenres = genreVotes
      .map((g) => ({ genre: g.genre, count: (g._count as unknown as number) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const mostActiveUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      points: u.points,
      level: u.level,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      userBadges: u.userBadges.map((ub) => ({ badge: ub.badge })),
    }));

    return {
      topGenres,
      topRatedMedia: topRated,
      mostActiveUsers,
    };
  }

  private toMediaDto(m: { id: string; title: string; description: string | null; coverUrl: string | null; year: number | null; authorOrDirector: string | null; genres: string[]; type: string; runtimeOrPages: number | null; externalRating: number | null }) {
    return { id: m.id, title: m.title, description: m.description, coverUrl: m.coverUrl, year: m.year, authorOrDirector: m.authorOrDirector, genres: m.genres, type: m.type, runtimeOrPages: m.runtimeOrPages, externalRating: m.externalRating };
  }
}
