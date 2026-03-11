import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { GenresService } from './genres.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get('votes')
  async getVotes(
    @Query('groupId') groupId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.genresService.getVotes(groupId, req.user.id);
  }

  @Post('votes')
  async vote(
    @Body() body: { genres: string[]; groupId: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.genresService.vote(req.user.id, body.genres ?? [], body.groupId);
  }
}
