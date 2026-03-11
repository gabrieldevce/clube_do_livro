'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { VoteSession, Media, User, ClubMeeting, Review } from '@/lib/types';
import type { GroupSummary, Group, PendingInvite } from '@/lib/types';

export function useMyGroups() {
  const token = getToken();
  return useQuery({
    queryKey: ['groups', 'my'],
    queryFn: () => api.get<GroupSummary[]>('/groups/my', token ?? undefined),
    enabled: !!token,
  });
}

export function useGroup(id: string | null) {
  const token = getToken();
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => api.get<Group>(`/groups/${id}`, token ?? undefined),
    enabled: !!id && !!token,
  });
}

export function usePendingInvites() {
  const token = getToken();
  return useQuery({
    queryKey: ['invites', 'pending'],
    queryFn: () => api.get<PendingInvite[]>('/groups/invites/pending', token ?? undefined),
    enabled: !!token,
  });
}

export function useVoteSessions(status?: string, groupId?: string) {
  const token = getToken();
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (groupId) params.set('groupId', groupId);
  const q = params.toString() ? `?${params.toString()}` : '';
  return useQuery({
    queryKey: ['votes', status, groupId],
    queryFn: () => api.get<VoteSession[]>(`/votes/sessions${q}`, token ?? undefined),
  });
}

export function useVoteSession(id: string | null) {
  const token = getToken();
  return useQuery({
    queryKey: ['vote', id],
    queryFn: () => api.get<VoteSession>(`/votes/sessions/${id}`, token ?? undefined),
    enabled: !!id,
  });
}

export function useRecommendations() {
  const token = getToken();
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get<Media[]>('/recommendations/next', token ?? undefined),
  });
}

export function useSeasonalRecommendations() {
  const token = getToken();
  return useQuery({
    queryKey: ['recommendations', 'seasonal'],
    queryFn: () => api.get<Media[]>('/recommendations/seasonal', token ?? undefined),
  });
}

export function useCalendar(start?: string, end?: string) {
  const token = getToken();
  const params = new URLSearchParams();
  if (start) params.set('start', start);
  if (end) params.set('end', end);
  const q = params.toString() ? `?${params.toString()}` : '';
  return useQuery({
    queryKey: ['calendar', start, end],
    queryFn: () => api.get<ClubMeeting[]>(`/calendar${q}`, token ?? undefined),
  });
}

export function useRankings(seasonId?: string) {
  const token = getToken();
  const params = seasonId ? `?seasonId=${seasonId}` : '';
  return useQuery({
    queryKey: ['rankings', seasonId],
    queryFn: () => api.get<User[]>(`/users/rankings${params}`, token ?? undefined),
  });
}

export function useRecentReviews() {
  const token = getToken();
  return useQuery({
    queryKey: ['reviews', 'recent'],
    queryFn: () => api.get<(Review & { media?: Media; user?: User })[]>('/reviews/recent', token ?? undefined),
  });
}

export function useMedia(id: string | null) {
  const token = getToken();
  return useQuery({
    queryKey: ['media', id],
    queryFn: () => api.get<Media & { averageRating?: number; reviews?: Review[] }>(`/media/${id}`, token ?? undefined),
    enabled: !!id,
  });
}

export function useMediaList(params?: { type?: string; genre?: string; search?: string }) {
  const token = getToken();
  const search = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  const q = search ? `?${search}` : '';
  return useQuery({
    queryKey: ['media', params],
    queryFn: () => api.get<Media[]>(`/media${q}`, token ?? undefined),
  });
}

export function useReviews(mediaId: string | null) {
  const token = getToken();
  return useQuery({
    queryKey: ['reviews', mediaId],
    queryFn: () => api.get<Review[]>(`/media/${mediaId}/reviews`, token ?? undefined),
    enabled: !!mediaId,
  });
}

export function useGenreVotes() {
  const token = getToken();
  return useQuery({
    queryKey: ['genres', 'votes'],
    queryFn: () => api.get<{ genre: string; totalVotes: number }[]>('/genres/votes', token ?? undefined),
  });
}

export function useSeasons() {
  const token = getToken();
  return useQuery({
    queryKey: ['seasons'],
    queryFn: () => api.get<{ id: string; name: string; isActive: boolean }[]>('/seasons', token ?? undefined),
  });
}

export function useUser(id: string | null) {
  const token = getToken();
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get<User>(`/users/${id}`, token ?? undefined),
    enabled: !!id,
  });
}

export function useDebateRoom(mediaId: string | null) {
  const token = getToken();
  return useQuery({
    queryKey: ['debate', mediaId],
    queryFn: () => api.get<{ id: string; mediaId: string }>(`/media/${mediaId}/debate`, token ?? undefined),
    enabled: !!mediaId && !!token,
  });
}

export function useDebateComments(roomId: string | null) {
  const token = getToken();
  return useQuery({
    queryKey: ['debate', 'comments', roomId],
    queryFn: () => api.get<(import('@/lib/types').DebateComment)[]>(`/debate/rooms/${roomId}/comments`, token ?? undefined),
    enabled: !!roomId,
  });
}

export function useStats() {
  const token = getToken();
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get<import('@/lib/types').StatsOverview>('/stats/overview', token ?? undefined),
  });
}

export function useGamification() {
  const token = getToken();
  return useQuery({
    queryKey: ['gamification'],
    queryFn: () => api.get<{ points: number; level: string; badges: { badge: import('@/lib/types').Badge }[] }>('/gamification/me', token ?? undefined),
    enabled: !!token,
  });
}
