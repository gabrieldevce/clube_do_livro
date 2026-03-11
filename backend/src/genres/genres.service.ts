import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class GenresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupsService: GroupsService,
  ) {}

  async getVotes(groupId: string, userId: string) {
    if (!groupId) throw new ForbiddenException('Grupo é obrigatório para ver votos de gêneros');
    await this.groupsService.ensureMember(groupId, userId);
    const weekStart = this.getWeekStart();
    const votes = await this.prisma.genreVote.groupBy({
      by: ['genre'],
      where: { weekStart, groupId },
      _count: { genre: true },
      _sum: { weight: true },
    });
    return votes
      .map((v) => ({ genre: v.genre, totalVotes: v._sum.weight ?? v._count.genre }))
      .sort((a, b) => b.totalVotes - a.totalVotes);
  }

  async vote(userId: string, genres: string[], groupId: string) {
    if (!groupId) throw new ForbiddenException('Grupo é obrigatório para votar em gêneros');
    const group = await this.groupsService.ensureMember(groupId, userId);
    const fullGroup = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { genreVotingOpen: true },
    });
    if (!fullGroup?.genreVotingOpen) {
      throw new ForbiddenException('Votação de gêneros está fechada para este grupo');
    }
    const weekStart = this.getWeekStart();
    await this.prisma.$transaction(
      genres.map((genre) =>
        this.prisma.genreVote.upsert({
          where: { userId_genre_weekStart_groupId: { userId, genre, weekStart, groupId } },
          create: { userId, genre, weekStart, groupId },
          update: { weight: { increment: 1 } },
        }),
      ),
    );
    return this.getVotes(groupId, userId);
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
