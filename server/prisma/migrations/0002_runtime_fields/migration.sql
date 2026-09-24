-- Add fields introduced after the initial schema.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'STARTER';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aiCredits" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "userId" TEXT;

UPDATE "Comment" SET "userId" = (SELECT "userId" FROM "CommunityPost" WHERE "CommunityPost"."id" = "Comment"."postId") WHERE "userId" IS NULL;
ALTER TABLE "Comment" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
