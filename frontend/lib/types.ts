export type MediaType = 'MOVIE' | 'BOOK';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  points: number;
  level: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  userBadges?: { badge: Badge }[];
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon?: string | null;
  pointsThreshold?: number | null;
}

export interface Media {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  year?: number | null;
  authorOrDirector?: string | null;
  genres: string[];
  type: MediaType;
  runtimeOrPages?: number | null;
  externalRating?: number | null;
  _count?: { reviews: number };
}

export interface VoteSession {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  options?: VoteOption[];
  winnerMedia?: Media | null;
}

export interface VoteOption {
  id: string;
  mediaId: string;
  voteCount: number;
  media?: Media;
}

export interface Review {
  id: string;
  userId: string;
  mediaId: string;
  rating: number;
  comment?: string | null;
  completed: boolean;
  createdAt: string;
  user?: User;
}

export interface ClubMeeting {
  id: string;
  title: string;
  date: string;
  type: 'MEETING' | 'VOTE_DEADLINE' | 'SEASONAL_EVENT';
  mediaId?: string | null;
}

export interface GenreVoteRank {
  genre: string;
  totalVotes: number;
}

export interface DebateComment {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: User;
  _count?: { reactions: number };
  userLiked?: boolean;
}

export interface Season {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  theme?: string | null;
  isActive: boolean;
}

export interface StatsOverview {
  topGenres: { genre: string; count: number }[];
  topRatedMedia: Media[];
  mostActiveUsers: User[];
}
