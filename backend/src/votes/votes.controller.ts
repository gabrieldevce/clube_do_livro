import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('votes/sessions')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Get()
  async getSessions(
    @Query('status') status: string | undefined,
    @Query('groupId') groupId: string | undefined,
    @Req() req: { user: { id: string } },
  ) {
    return this.votesService.getSessions(status, groupId, req.user.id);
  }

  @Get(':id')
  async getSession(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.votesService.getSessionById(id, req.user.id);
  }

  @Post(':id/vote')
  async vote(
    @Param('id') sessionId: string,
    @Body() body: { voteOptionId: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.votesService.vote(sessionId, req.user.id, body.voteOptionId);
  }
}
