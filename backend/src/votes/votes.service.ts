import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class VotesService {
  constructor(private readonly prisma: PrismaService) {}

  async getSessions(status?: string) {
    const where = status ? { status } : {};
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
