import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';
import { GroupVotesController } from './group-votes.controller';
import { VotesService } from './votes.service';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [GroupsModule],
  controllers: [VotesController, GroupVotesController],
  providers: [VotesService],
})
export class VotesModule {}
