import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import fetch from 'node-fetch';
import { MediaType } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { type?: string; genre?: string; search?: string }) {
    const where: { type?: 'MOVIE' | 'BOOK'; genres?: { has: string }; title?: { contains: string; mode: 'insensitive' } } = {};
    if (params.type) where.type = params.type as 'MOVIE' | 'BOOK';
    if (params.genre) where.genres = { has: params.genre };
    if (params.search) where.title = { contains: params.search, mode: 'insensitive' };
    const media = await this.prisma.media.findMany({ where });
    return media.map((m) => this.toMediaDto(m));
  }

  async getById(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        reviews: { include: { user: { include: { userBadges: { include: { badge: true } } } } } },
      },
    });
    if (!media) return null;
    const avg = media.reviews.length
      ? media.reviews.reduce((s, r) => s + r.rating, 0) / media.reviews.length
      : undefined;
    return {
      ...this.toMediaDto(media),
      averageRating: avg,
      reviews: media.reviews.map((r) => ({
        id: r.id,
        userId: r.userId,
        mediaId: r.mediaId,
        rating: r.rating,
        comment: r.comment,
        completed: r.completed,
        createdAt: r.createdAt.toISOString(),
        user: r.user ? this.toUserDto(r.user) : undefined,
      })),
    };
  }

  async getDebateRoom(mediaId: string) {
    let room = await this.prisma.debateRoom.findFirst({
      where: { mediaId },
    });
    if (!room) {
      room = await this.prisma.debateRoom.create({
        data: { mediaId },
      });
    }
    return { id: room.id, mediaId: room.mediaId };
  }

  async searchExternal(query: string) {
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
      throw new Error('OMDB_API_KEY não configurada');
    }
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&type=movie&s=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Erro ao buscar filmes na OMDb');
    }
    const data = (await res.json()) as any;
    if (data.Response === 'False') {
      return [];
    }
    return (data.Search || []).map((item: any) => ({
      imdbId: item.imdbID as string,
      title: item.Title as string,
      year: item.Year as string | undefined,
      poster: item.Poster && item.Poster !== 'N/A' ? (item.Poster as string) : undefined,
    }));
  }

  async createFromOmdb(imdbId: string) {
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
      throw new Error('OMDB_API_KEY não configurada');
    }
    const url = `https://www.omdbapi.com/?apikey=${apiKey}&i=${encodeURIComponent(imdbId)}&plot=full`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Erro ao buscar detalhes do filme na OMDb');
    }
    const data = (await res.json()) as any;
    if (data.Response === 'False') {
      throw new Error('Filme não encontrado na OMDb');
    }

    const existing = await this.prisma.media.findFirst({
      where: { externalId: data.imdbID as string },
    });
    if (existing) {
      return this.toMediaDto(existing);
    }

    const genres = typeof data.Genre === 'string' ? data.Genre.split(',').map((g: string) => g.trim()) : [];
    const runtimeMatch = typeof data.Runtime === 'string' ? parseInt(data.Runtime, 10) : undefined;
    const rating = data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : undefined;

    const created = await this.prisma.media.create({
      data: {
        title: data.Title as string,
        description: data.Plot && data.Plot !== 'N/A' ? (data.Plot as string) : null,
        coverUrl: data.Poster && data.Poster !== 'N/A' ? (data.Poster as string) : null,
        year: data.Year && data.Year !== 'N/A' ? parseInt(data.Year, 10) : null,
        authorOrDirector: data.Director && data.Director !== 'N/A' ? (data.Director as string) : null,
        genres,
        type: MediaType.MOVIE,
        runtimeOrPages: Number.isFinite(runtimeMatch) ? (runtimeMatch as number) : null,
        externalRating: Number.isFinite(rating) ? (rating as number) : null,
        externalId: data.imdbID as string,
        source: 'OMDb',
      },
    });

    return this.toMediaDto(created);
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

  private toUserDto(u: { id: string; name: string; email: string; avatarUrl: string | null; points: number; level: string; role: string; createdAt: Date; userBadges?: Array<{ badge: unknown }> }) {
    return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl, points: u.points, level: u.level, role: u.role, createdAt: u.createdAt.toISOString(), userBadges: u.userBadges?.map((ub) => ({ badge: ub.badge })) ?? [] };
  }
}
