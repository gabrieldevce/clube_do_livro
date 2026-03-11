import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GroupMemberRole } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: { name: string; description?: string }) {
    const group = await this.prisma.group.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        createdById: userId,
      },
    });
    await this.prisma.groupMember.create({
      data: { groupId: group.id, userId, role: GroupMemberRole.OWNER },
    });
    return this.getById(group.id, userId);
  }

  async listMy(userId: string) {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
      include: { group: { include: { _count: { select: { members: true } } } } },
    });
    return memberships.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      description: m.group.description,
      role: m.role,
      memberCount: m.group._count.members,
      createdAt: m.group.createdAt.toISOString(),
    }));
  }

  async getById(groupId: string, userId?: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        _count: { select: { members: true, voteSessions: true } },
      },
    });
    if (!group) return null;
    const membership = userId ? await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    }) : null;
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt.toISOString(),
      memberCount: group._count.members,
      voteSessionCount: group._count.voteSessions,
      myRole: membership?.role ?? null,
      members: group.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
        user: m.user,
      })),
    };
  }

  async update(groupId: string, userId: string, data: { name?: string; description?: string }) {
    await this.ensureAdmin(groupId, userId);
    await this.prisma.group.update({
      where: { id: groupId },
      data: { name: data.name, description: data.description },
    });
    return this.getById(groupId, userId);
  }

  async delete(groupId: string, userId: string) {
    const mem = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (mem?.role !== GroupMemberRole.OWNER) throw new ForbiddenException('Apenas o dono pode excluir o grupo');
    await this.prisma.group.delete({ where: { id: groupId } });
  }

  async ensureAdmin(groupId: string, userId: string) {
    const m = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!m || (m.role !== GroupMemberRole.OWNER && m.role !== GroupMemberRole.ADMIN))
      throw new ForbiddenException('Acesso negado');
    return m;
  }

  async ensureMember(groupId: string, userId: string) {
    const m = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!m) throw new ForbiddenException('Você não é membro deste grupo');
    return m;
  }
}
