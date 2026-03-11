-- AlterTable
ALTER TABLE "GenreVote" ADD COLUMN "groupId" TEXT;

-- CreateIndex / Constraint
ALTER TABLE "GenreVote"
ADD CONSTRAINT "GenreVote_userId_genre_weekStart_groupId_key"
UNIQUE ("userId", "genre", "weekStart", "groupId");

-- Add foreign key to Group
ALTER TABLE "GenreVote"
ADD CONSTRAINT "GenreVote_groupId_fkey"
FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter Group to add genreVotingOpen
ALTER TABLE "Group"
ADD COLUMN "genreVotingOpen" BOOLEAN NOT NULL DEFAULT true;

