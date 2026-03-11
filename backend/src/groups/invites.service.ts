import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GroupsService } from './groups.service';
import * as crypto from 'crypto';

@Injectable()
export class InvitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groupsService: GroupsService,
  ) {}

  async create(groupId: string, invitedById: string, email: string) {
    await this.groupsService.ensureAdmin(groupId, invitedById);
    const existing = await this.prisma.groupMember.findFirst({
      where: { groupId, user: { email } },
    });
    if (existing) throw new ForbiddenException('Usuário já é membro');
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const invite = await this.prisma.groupInvite.upsert({
      where: { groupId_email: { groupId, email } },
      create: { groupId, email, invitedById, token, expiresAt },
      update: { status: 'PENDING', token, expiresAt },
    });
    return { id: invite.id, email: invite.email, expiresAt: invite.expiresAt?.toISOString() };
  }

  async listPendingForUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [];
    const invites = await this.prisma.groupInvite.findMany({
      where: { email: user.email, status: 'PENDING' },
      include: { group: true, invitedBy: { select: { name: true } } },
    });
    return invites.map((i) => ({
      id: i.id,
      groupId: i.groupId,
      groupName: i.group.name,
      invitedByName: i.invitedBy.name,
      expiresAt: i.expiresAt?.toISOString(),
    }));
  }

  async accept(inviteId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('Usuário não encontrado');
    const invite = await this.prisma.groupInvite.findUnique({
      where: { id: inviteId },
      include: { group: true },
    });
    if (!invite || invite.email !== user.email || invite.status !== 'PENDING')
      throw new ForbiddenException('Convite inválido');
    if (invite.expiresAt && invite.expiresAt < new Date()) throw new ForbiddenException('Convite expirado');
    await this.prisma.$transaction([
      this.prisma.groupMember.create({
        data: { groupId: invite.groupId, userId, role: 'MEMBER' },
      }),
      this.prisma.groupInvite.update({
        where: { id: inviteId },
        data: { status: 'ACCEPTED' },
      }),
    ]);
    return { groupId: invite.groupId, groupName: invite.group.name };
  }

  async reject(inviteId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const invite = await this.prisma.groupInvite.findUnique({ where: { id: inviteId } });
    if (!invite || invite.email !== user?.email) throw new ForbiddenException('Convite inválido');
    await this.prisma.groupInvite.update({
      where: { id: inviteId },
      data: { status: 'REJECTED' },
    });
    return { ok: true };
  }

  async listForGroup(groupId: string, userId: string) {
    await this.groupsService.ensureAdmin(groupId, userId);
    const invites = await this.prisma.groupInvite.findMany({
      where: { groupId, status: 'PENDING' },
      include: { invitedBy: { select: { name: true } } },
    });
    return invites.map((i) => ({
      id: i.id,
      email: i.email,
      invitedByName: i.invitedBy.name,
      expiresAt: i.expiresAt?.toISOString(),
    }));
  }
}
