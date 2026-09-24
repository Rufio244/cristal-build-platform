-- CreateTable
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "User" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(), "email" TEXT NOT NULL, "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL DEFAULT '', "plan" TEXT NOT NULL DEFAULT 'STARTER', "aiCredits" INTEGER NOT NULL DEFAULT 50,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Website" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(), "userId" TEXT NOT NULL, "title" TEXT NOT NULL,
  "subdomain" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'DRAFT', "views" INTEGER NOT NULL DEFAULT 0,
  "pages" JSONB NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Website_subdomain_key" ON "Website"("subdomain");
ALTER TABLE "Website" ADD CONSTRAINT "Website_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CommunityPost" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(), "userId" TEXT NOT NULL, "websiteId" TEXT NOT NULL,
  "caption" TEXT NOT NULL, "tags" TEXT[] NOT NULL, "likesCount" INTEGER NOT NULL DEFAULT 0,
  "sharesCount" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Comment" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(), "postId" TEXT NOT NULL, "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
