import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DebateService {
  constructor(private readonly prisma: PrismaService) {}

  async getComments(roomId: string, userId?: string) {
    const comments = await this.prisma.debateComment.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { include: { userBadges: { include: { badge: true } } } },
        _count: { select: { reactions: true } },
      },
    });
    const reactionUserIds = userId
      ? await this.prisma.debateReaction.findMany({
          where: { userId, commentId: { in: comments.map((c) => c.id) } },
          select: { commentId: true },
        }).then((r) => new Set(r.map((x) => x.commentId)))
      : new Set<string>();
    return comments.map((c) => ({
      id: c.id,
      roomId: c.roomId,
      userId: c.userId,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      user: c.user ? this.toUserDto(c.user) : undefined,
      _count: c._count,
      userLiked: reactionUserIds.has(c.id),
    }));
  }

  async createComment(roomId: string, userId: string, content: string) {
    return this.prisma.debateComment.create({
      data: { roomId, userId, content },
    });
  }

  async likeComment(commentId: string, userId: string) {
    await this.prisma.debateReaction.upsert({
      where: { commentId_userId: { commentId, userId } },
      create: { commentId, userId },
      update: {},
    });
  }

  private toUserDto(u: { id: string; name: string; email: string; avatarUrl: string | null; points: number; level: string; role: string; createdAt: Date; userBadges?: Array<{ badge: unknown }> }) {
    return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl, points: u.points, level: u.level, role: u.role, createdAt: u.createdAt.toISOString(), userBadges: u.userBadges?.map((ub) => ({ badge: ub.badge })) ?? [] };
  }
}
