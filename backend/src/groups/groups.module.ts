import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { InvitesService } from './invites.service';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService, InvitesService],
  exports: [GroupsService],
})
export class GroupsModule {}
