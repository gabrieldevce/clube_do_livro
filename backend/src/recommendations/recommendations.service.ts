import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNext() {
    const media = await this.prisma.media.findMany({
      take: 10,
      orderBy: { id: 'asc' },
    });
    return media.map((m) => this.toMediaDto(m));
  }

  async getSeasonal() {
    const season = await this.prisma.season.findFirst({
      where: { isActive: true },
      include: { featuredMedia: true },
    });
    if (!season?.featuredMedia?.length) {
      const media = await this.prisma.media.findMany({ take: 5 });
      return media.map((m) => this.toMediaDto(m));
    }
    return season.featuredMedia.map((m) => this.toMediaDto(m));
  }

  private toMediaDto(m: {
    id: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    year: number | null;
    authorOrDirector: string | null;
    genres: string[];
    type: string;
    runtimeOrPages: number | null;
    externalRating: number | null;
  }) {
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      coverUrl: m.coverUrl,
      year: m.year,
      authorOrDirector: m.authorOrDirector,
      genres: m.genres,
      type: m.type,
      runtimeOrPages: m.runtimeOrPages,
      externalRating: m.externalRating,
    };
  }
}
