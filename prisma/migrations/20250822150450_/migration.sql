-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('pending', 'accepted');

-- AlterTable
ALTER TABLE "public"."Claim" ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'pending';
