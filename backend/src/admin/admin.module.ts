import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [ReviewsModule],
  controllers: [AdminController],
})
export class AdminModule {}
