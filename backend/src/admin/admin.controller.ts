import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from '../reviews/reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

@Controller('admin')
export class AdminController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('reviews/:id')
  async deleteReview(@Param('id') id: string) {
    await this.reviewsService.deleteReview(id);
  }
}
