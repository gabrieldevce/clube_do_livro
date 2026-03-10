import { Controller, Get } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('next')
  async getNext() {
    return this.recommendationsService.getNext();
  }

  @Get('seasonal')
  async getSeasonal() {
    return this.recommendationsService.getSeasonal();
  }
}
