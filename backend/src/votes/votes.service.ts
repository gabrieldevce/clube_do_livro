import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class VotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupsService: GroupsService,
  ) {}

  async getSessions(status?: string, groupId?: string) {
    const where: { status?: string; groupId?: string | null } = {};
    if (status) where.status = status;
    if (groupId !== undefined) where.groupId = groupId || null;
    const sessions = await this.prisma.voteSession.findMany({
      where,
      orderBy: { endDate: 'desc' },
      include: {
        options: { include: { media: true } },
        winnerMedia: true,
      },
    });
    return sessions.map((s) => this.toSessionDto(s));
  }

  async getSessionById(id: string) {
    const session = await this.prisma.voteSession.findUnique({
      where: { id },
      include: {
        options: { include: { media: true } },
        winnerMedia: true,
      },
    });
    if (!session) return null;
    return this.toSessionDto(session);
  }

  async vote(sessionId: string, userId: string, voteOptionId: string) {
    const option = await this.prisma.voteOption.findFirst({
      where: { id: voteOptionId, voteSessionId: sessionId },
    });
    if (!option) throw new Error('Opção de voto inválida');
    const session = await this.prisma.voteSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.status !== 'OPEN') throw new Error('Votação encerrada ou inexistente');
    await this.prisma.$transaction([
      this.prisma.userVote.upsert({
        where: {
          voteSessionId_userId: { voteSessionId: sessionId, userId },
        },
        create: { voteSessionId: sessionId, userId, voteOptionId },
        update: { voteOptionId },
      }),
      this.prisma.voteOption.updateMany({
        where: { voteSessionId: sessionId },
        data: { voteCount: 0 },
      }),
    ]);
    const options = await this.prisma.voteOption.findMany({
      where: { voteSessionId: sessionId },
      include: { media: true },
    });
    for (const opt of options) {
      const count = await this.prisma.userVote.count({
        where: { voteSessionId: sessionId, voteOptionId: opt.id },
      });
      await this.prisma.voteOption.update({
        where: { id: opt.id },
        data: { voteCount: count },
      });
    }
    return this.getSessionById(sessionId);
  }

  async createSessionForGroup(
    groupId: string,
    userId: string,
    data: { title: string; startDate: string; endDate: string },
  ) {
    await this.groupsService.ensureAdmin(groupId, userId);
    const session = await this.prisma.voteSession.create({
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: 'OPEN',
        groupId,
      },
    });
    return this.getSessionById(session.id);
  }

  async addOptionToSession(sessionId: string, groupId: string, userId: string, mediaId: string) {
    await this.groupsService.ensureAdmin(groupId, userId);
    const session = await this.prisma.voteSession.findFirst({
      where: { id: sessionId, groupId },
    });
    if (!session) throw new ForbiddenException('Sessão não encontrada');
    if (session.status !== 'OPEN') throw new ForbiddenException('Sessão já encerrada');
    await this.prisma.voteOption.upsert({
      where: { voteSessionId_mediaId: { voteSessionId: sessionId, mediaId } },
      create: { voteSessionId: sessionId, mediaId },
      update: {},
    });
    return this.getSessionById(sessionId);
  }

  async removeOptionFromSession(sessionId: string, groupId: string, userId: string, optionId: string) {
    await this.groupsService.ensureAdmin(groupId, userId);
    const session = await this.prisma.voteSession.findFirst({
      where: { id: sessionId, groupId },
    });
    if (!session) throw new ForbiddenException('Sessão não encontrada');
    await this.prisma.voteOption.deleteMany({
      where: { id: optionId, voteSessionId: sessionId },
    });
    return this.getSessionById(sessionId);
  }

  async closeSession(sessionId: string, groupId: string, userId: string) {
    await this.groupsService.ensureAdmin(groupId, userId);
    const session = await this.prisma.voteSession.findFirst({
      where: { id: sessionId, groupId },
      include: { options: { orderBy: { voteCount: 'desc' } } },
    });
    if (!session) throw new ForbiddenException('Sessão não encontrada');
    const winnerOption = session.options[0];
    await this.prisma.voteSession.update({
      where: { id: sessionId },
      data: {
        status: 'CLOSED',
        winnerMediaId: winnerOption?.mediaId ?? null,
      },
    });
    return this.getSessionById(sessionId);
  }

  private toSessionDto(s: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    status: string;
    options?: Array<{
      id: string;
      mediaId: string;
      voteCount: number;
      media?: unknown;
    }>;
    winnerMedia?: unknown;
  }) {
    return {
      id: s.id,
      title: s.title,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      status: s.status,
      options: s.options?.map((o) => ({
        id: o.id,
        mediaId: o.mediaId,
        voteCount: o.voteCount,
        media: o.media,
      })),
      winnerMedia: s.winnerMedia ?? null,
    };
  }
}
