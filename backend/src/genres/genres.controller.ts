import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { GenresService } from './genres.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get('votes')
  async getVotes() {
    return this.genresService.getVotes();
  }

  @UseGuards(JwtAuthGuard)
  @Post('votes')
  async vote(@Body() body: { genres: string[] }, @Req() req: { user: { id: string } }) {
    return this.genresService.vote(req.user.id, body.genres ?? []);
  }
}
