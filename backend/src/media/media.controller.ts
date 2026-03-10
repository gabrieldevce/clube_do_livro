import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { MediaService } from './media.service';
import { ReviewsService } from '../reviews/reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  async list(@Query('type') type?: string, @Query('genre') genre?: string, @Query('search') search?: string) {
    return this.mediaService.list({ type, genre, search });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.mediaService.getById(id);
  }

  @Get(':mediaId/reviews')
  async getReviews(@Param('mediaId') mediaId: string) {
    return this.reviewsService.getByMediaId(mediaId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':mediaId/reviews')
  async createReview(
    @Param('mediaId') mediaId: string,
    @Body() body: { rating: number; comment?: string; completed: boolean },
    @Req() req: { user: { id: string } },
  ) {
    return this.reviewsService.create(mediaId, req.user.id, body);
  }

  @Get(':mediaId/debate')
  async getDebate(@Param('mediaId') mediaId: string) {
    return this.mediaService.getDebateRoom(mediaId);
  }
}
