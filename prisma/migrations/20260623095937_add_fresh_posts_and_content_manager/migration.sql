-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'CONTENT_MANAGER';

-- CreateTable
CREATE TABLE "public"."FreshPost" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "caption" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreshPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FreshLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreshLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FreshComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreshComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FreshPost_authorUserId_idx" ON "public"."FreshPost"("authorUserId");

-- CreateIndex
CREATE INDEX "FreshPost_status_createdAt_idx" ON "public"."FreshPost"("status", "createdAt");

-- CreateIndex
CREATE INDEX "FreshLike_postId_idx" ON "public"."FreshLike"("postId");

-- CreateIndex
CREATE INDEX "FreshLike_userId_idx" ON "public"."FreshLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FreshLike_postId_userId_key" ON "public"."FreshLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "FreshComment_postId_idx" ON "public"."FreshComment"("postId");

-- CreateIndex
CREATE INDEX "FreshComment_userId_idx" ON "public"."FreshComment"("userId");

-- AddForeignKey
ALTER TABLE "public"."FreshPost" ADD CONSTRAINT "FreshPost_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FreshLike" ADD CONSTRAINT "FreshLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."FreshPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FreshLike" ADD CONSTRAINT "FreshLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FreshComment" ADD CONSTRAINT "FreshComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."FreshPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FreshComment" ADD CONSTRAINT "FreshComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
