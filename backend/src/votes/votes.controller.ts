import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('votes/sessions')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Get()
  async getSessions(@Query('status') status?: string) {
    return this.votesService.getSessions(status);
  }

  @Get(':id')
  async getSession(@Param('id') id: string) {
    return this.votesService.getSessionById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/vote')
  async vote(
    @Param('id') sessionId: string,
    @Body() body: { voteOptionId: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.votesService.vote(sessionId, req.user.id, body.voteOptionId);
  }
}
