import { Module } from '@nestjs/common';
import { GroupsModule } from '../groups/groups.module';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';

@Module({
  imports: [GroupsModule],
  controllers: [GenresController],
  providers: [GenresService],
})
export class GenresModule {}
