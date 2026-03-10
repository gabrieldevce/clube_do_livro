import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getRankings(seasonId?: string) {
    const users = await this.prisma.user.findMany({
      orderBy: { points: 'desc' },
      take: 50,
      include: { userBadges: { include: { badge: true } } },
    });
    return users.map((u) => this.toUserDto(u));
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userBadges: { include: { badge: true } } },
    });
    if (!user) return null;
    return this.toUserDto(user);
  }

  private toUserDto(u: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    points: number;
    level: string;
    role: string;
    createdAt: Date;
    userBadges?: Array<{ badge: unknown }>;
  }) {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      points: u.points,
      level: u.level,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      userBadges: u.userBadges?.map((ub) => ({ badge: ub.badge })) ?? [],
    };
  }
}
