-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('MOVIE', 'BOOK');

-- CreateEnum
CREATE TYPE "ClubEventType" AS ENUM ('MEETING', 'VOTE_DEADLINE', 'SEASONAL_EVENT');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('VOTE', 'REVIEW', 'COMMENT', 'SUGGESTION');

-- CreateEnum
CREATE TYPE "DebateReactionType" AS ENUM ('LIKE');

-- CreateEnum
CREATE TYPE "WatchPartyStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'Beginner',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "pointsThreshold" INTEGER,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "year" INTEGER,
    "authorOrDirector" TEXT,
    "genres" TEXT[],
    "type" "MediaType" NOT NULL,
    "runtimeOrPages" INTEGER,
    "externalRating" DOUBLE PRECISION,
    "externalId" TEXT,
    "source" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "theme" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMeeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "ClubEventType" NOT NULL,
    "seasonId" TEXT,
    "mediaId" TEXT,

    CONSTRAINT "ClubMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "seasonId" TEXT,
    "winnerMediaId" TEXT,

    CONSTRAINT "VoteSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteOption" (
    "id" TEXT NOT NULL,
    "voteSessionId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VoteOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVote" (
    "id" TEXT NOT NULL,
    "voteSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenreVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenreVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebateRoom" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seasonId" TEXT,

    CONSTRAINT "DebateRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebateComment" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebateComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebateReaction" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DebateReactionType" NOT NULL DEFAULT 'LIKE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebateReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchParty" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "status" "WatchPartyStatus" NOT NULL DEFAULT 'SCHEDULED',
    "seasonId" TEXT,

    CONSTRAINT "WatchParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchPartyMessage" (
    "id" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchPartyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SeasonFeaturedMedia" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_code_key" ON "Badge"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "VoteOption_voteSessionId_mediaId_key" ON "VoteOption"("voteSessionId", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "UserVote_voteSessionId_userId_key" ON "UserVote"("voteSessionId", "userId");

-- CreateIndex
CREATE INDEX "Review_mediaId_idx" ON "Review"("mediaId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GenreVote_userId_genre_weekStart_key" ON "GenreVote"("userId", "genre", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "DebateReaction_commentId_userId_key" ON "DebateReaction"("commentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "_SeasonFeaturedMedia_AB_unique" ON "_SeasonFeaturedMedia"("A", "B");

-- CreateIndex
CREATE INDEX "_SeasonFeaturedMedia_B_index" ON "_SeasonFeaturedMedia"("B");

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMeeting" ADD CONSTRAINT "ClubMeeting_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMeeting" ADD CONSTRAINT "ClubMeeting_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSession" ADD CONSTRAINT "VoteSession_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteSession" ADD CONSTRAINT "VoteSession_winnerMediaId_fkey" FOREIGN KEY ("winnerMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteOption" ADD CONSTRAINT "VoteOption_voteSessionId_fkey" FOREIGN KEY ("voteSessionId") REFERENCES "VoteSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteOption" ADD CONSTRAINT "VoteOption_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVote" ADD CONSTRAINT "UserVote_voteSessionId_fkey" FOREIGN KEY ("voteSessionId") REFERENCES "VoteSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVote" ADD CONSTRAINT "UserVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVote" ADD CONSTRAINT "UserVote_voteOptionId_fkey" FOREIGN KEY ("voteOptionId") REFERENCES "VoteOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenreVote" ADD CONSTRAINT "GenreVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateRoom" ADD CONSTRAINT "DebateRoom_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateRoom" ADD CONSTRAINT "DebateRoom_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateComment" ADD CONSTRAINT "DebateComment_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "DebateRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateComment" ADD CONSTRAINT "DebateComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateReaction" ADD CONSTRAINT "DebateReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "DebateComment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebateReaction" ADD CONSTRAINT "DebateReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchParty" ADD CONSTRAINT "WatchParty_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchParty" ADD CONSTRAINT "WatchParty_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchPartyMessage" ADD CONSTRAINT "WatchPartyMessage_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "WatchParty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchPartyMessage" ADD CONSTRAINT "WatchPartyMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeasonFeaturedMedia" ADD CONSTRAINT "_SeasonFeaturedMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeasonFeaturedMedia" ADD CONSTRAINT "_SeasonFeaturedMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
