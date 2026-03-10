import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { type?: string; genre?: string; search?: string }) {
    const where: { type?: 'MOVIE' | 'BOOK'; genres?: { has: string }; title?: { contains: string; mode: 'insensitive' } } = {};
    if (params.type) where.type = params.type as 'MOVIE' | 'BOOK';
    if (params.genre) where.genres = { has: params.genre };
    if (params.search) where.title = { contains: params.search, mode: 'insensitive' };
    const media = await this.prisma.media.findMany({ where });
    return media.map((m) => this.toMediaDto(m));
  }

  async getById(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        reviews: { include: { user: { include: { userBadges: { include: { badge: true } } } } } },
      },
    });
    if (!media) return null;
    const avg = media.reviews.length
      ? media.reviews.reduce((s, r) => s + r.rating, 0) / media.reviews.length
      : undefined;
    return {
      ...this.toMediaDto(media),
      averageRating: avg,
      reviews: media.reviews.map((r) => ({
        id: r.id,
        userId: r.userId,
        mediaId: r.mediaId,
        rating: r.rating,
        comment: r.comment,
        completed: r.completed,
        createdAt: r.createdAt.toISOString(),
        user: r.user ? this.toUserDto(r.user) : undefined,
      })),
    };
  }

  async getDebateRoom(mediaId: string) {
    let room = await this.prisma.debateRoom.findFirst({
      where: { mediaId },
    });
    if (!room) {
      room = await this.prisma.debateRoom.create({
        data: { mediaId },
      });
    }
    return { id: room.id, mediaId: room.mediaId };
  }

  private toMediaDto(m: {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    year: number | null;
    authorOrDirector: string | null;
    genres: string[];
    type: string;
    runtimeOrPages: number | null;
    externalRating: number | null;
  }) {
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      coverUrl: m.coverUrl,
      year: m.year,
      authorOrDirector: m.authorOrDirector,
      genres: m.genres,
      type: m.type,
      runtimeOrPages: m.runtimeOrPages,
      externalRating: m.externalRating,
    };
  }

  private toUserDto(u: { id: string; name: string; email: string; avatarUrl: string | null; points: number; level: string; role: string; createdAt: Date; userBadges?: Array<{ badge: unknown }> }) {
    return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl, points: u.points, level: u.level, role: u.role, createdAt: u.createdAt.toISOString(), userBadges: u.userBadges?.map((ub) => ({ badge: ub.badge })) ?? [] };
  }
}
