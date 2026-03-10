import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('recent')
  async getRecent() {
    return this.reviewsService.getRecent();
  }
}
