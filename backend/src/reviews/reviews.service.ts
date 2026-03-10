import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecent() {
    const reviews = await this.prisma.review.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { media: true, user: { include: { userBadges: { include: { badge: true } } } } },
    });
    return reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      mediaId: r.mediaId,
      rating: r.rating,
      comment: r.comment,
      completed: r.completed,
      createdAt: r.createdAt.toISOString(),
      media: this.toMediaDto(r.media),
      user: this.toUserDto(r.user),
    }));
  }

  async getByMediaId(mediaId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { mediaId },
      orderBy: { createdAt: 'desc' },
      include: { user: { include: { userBadges: { include: { badge: true } } } } },
    });
    return reviews.map((r) => ({
      id: r.id,
      userId: r.userId,
      mediaId: r.mediaId,
      rating: r.rating,
      comment: r.comment,
      completed: r.completed,
      createdAt: r.createdAt.toISOString(),
      user: this.toUserDto(r.user),
    }));
  }

  async create(mediaId: string, userId: string, data: { rating: number; comment?: string; completed: boolean }) {
    const review = await this.prisma.review.create({
      data: {
        mediaId,
        userId,
        rating: data.rating,
        comment: data.comment ?? null,
        completed: data.completed ?? false,
      },
    });
    await this.awardPoints(userId, 'REVIEW');
    return review;
  }

  async deleteReview(id: string) {
    await this.prisma.review.delete({ where: { id } });
  }

  private async awardPoints(userId: string, _type: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { points: { increment: 5 } },
    });
  }

  private toMediaDto(m: { id: string; title: string; description: string | null; coverUrl: string | null; year: number | null; authorOrDirector: string | null; genres: string[]; type: string; runtimeOrPages: number | null; externalRating: number | null }) {
    return { id: m.id, title: m.title, description: m.description, coverUrl: m.coverUrl, year: m.year, authorOrDirector: m.authorOrDirector, genres: m.genres, type: m.type, runtimeOrPages: m.runtimeOrPages, externalRating: m.externalRating };
  }

  private toUserDto(u: { id: string; name: string; email: string; avatarUrl: string | null; points: number; level: string; role: string; createdAt: Date; userBadges?: Array<{ badge: unknown }> }) {
    return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl, points: u.points, level: u.level, role: u.role, createdAt: u.createdAt.toISOString(), userBadges: u.userBadges?.map((ub) => ({ badge: ub.badge })) ?? [] };
  }
}
