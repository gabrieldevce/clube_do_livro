import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userBadges: { include: { badge: true } } },
    });
    if (!user) return null;
    return {
      points: user.points,
      level: user.level,
      badges: user.userBadges.map((ub) => ({ badge: ub.badge })),
    };
  }
}
