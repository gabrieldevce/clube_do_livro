import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { DebateService } from './debate.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('debate')
export class DebateController {
  constructor(private readonly debateService: DebateService) {}

  @Get('rooms/:roomId/comments')
  async getComments(@Param('roomId') roomId: string, @Req() req?: { user?: { id: string } }) {
    return this.debateService.getComments(roomId, req?.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rooms/:roomId/comments')
  async createComment(
    @Param('roomId') roomId: string,
    @Body() body: { content: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.debateService.createComment(roomId, req.user.id, body.content);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comments/:commentId/like')
  async likeComment(@Param('commentId') commentId: string, @Req() req: { user: { id: string } }) {
    await this.debateService.likeComment(commentId, req.user.id);
    return {};
  }
}
