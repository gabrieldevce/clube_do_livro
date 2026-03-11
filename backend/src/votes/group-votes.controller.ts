import { Controller, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupVotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post(':groupId/vote-sessions')
  async createSession(
    @Param('groupId') groupId: string,
    @Body() body: { title: string; startDate: string; endDate: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.votesService.createSessionForGroup(groupId, req.user.id, body);
  }

  @Post(':groupId/vote-sessions/:sessionId/options')
  async addOption(
    @Param('groupId') groupId: string,
    @Param('sessionId') sessionId: string,
    @Body() body: { mediaId: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.votesService.addOptionToSession(sessionId, groupId, req.user.id, body.mediaId);
  }

  @Patch(':groupId/vote-sessions/:sessionId/close')
  async closeSession(
    @Param('groupId') groupId: string,
    @Param('sessionId') sessionId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.votesService.closeSession(sessionId, groupId, req.user.id);
  }
}
