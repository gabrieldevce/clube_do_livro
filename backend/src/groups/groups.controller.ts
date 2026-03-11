import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { InvitesService } from './invites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly invitesService: InvitesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: { name: string; description?: string }, @Req() req: { user: { id: string } }) {
    return this.groupsService.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async listMy(@Req() req: { user: { id: string } }) {
    return this.groupsService.listMy(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('invites/pending')
  async listMyInvites(@Req() req: { user: { id: string } }) {
    return this.invitesService.listPendingForUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invites/:inviteId/accept')
  async acceptInvite(@Param('inviteId') inviteId: string, @Req() req: { user: { id: string } }) {
    return this.invitesService.accept(inviteId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invites/:inviteId/reject')
  async rejectInvite(@Param('inviteId') inviteId: string, @Req() req: { user: { id: string } }) {
    return this.invitesService.reject(inviteId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: { user?: { id: string } }) {
    return this.groupsService.getById(id, req.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.groupsService.update(id, req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    await this.groupsService.delete(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/invites')
  async invite(@Param('id') id: string, @Body() body: { email: string }, @Req() req: { user: { id: string } }) {
    return this.invitesService.create(id, req.user.id, body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/invites')
  async listInvites(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.invitesService.listForGroup(id, req.user.id);
  }
}
