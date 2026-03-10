import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { VotesModule } from './votes/votes.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { CalendarModule } from './calendar/calendar.module';
import { UsersModule } from './users/users.module';
import { GamificationModule } from './gamification/gamification.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MediaModule } from './media/media.module';
import { DebateModule } from './debate/debate.module';
import { GenresModule } from './genres/genres.module';
import { SeasonsModule } from './seasons/seasons.module';
import { StatsModule } from './stats/stats.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    VotesModule,
    RecommendationsModule,
    CalendarModule,
    UsersModule,
    GamificationModule,
    ReviewsModule,
    MediaModule,
    DebateModule,
    GenresModule,
    SeasonsModule,
    StatsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
