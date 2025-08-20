-- CreateEnum
CREATE TYPE "public"."Food_type" AS ENUM ('veg', 'nonveg');

-- CreateEnum
CREATE TYPE "public"."Quantity_type" AS ENUM ('plates', 'kg', 'items');

-- CreateEnum
CREATE TYPE "public"."Freshness_status" AS ENUM ('freshcooked', 'packaged', 'near_expiry', 'unknown');

-- CreateTable
CREATE TABLE "public"."Post" (
    "post_id" SERIAL NOT NULL,
    "food_name" TEXT NOT NULL,
    "food_type" "public"."Food_type" NOT NULL,
    "quantity_value" INTEGER NOT NULL,
    "quantity_type" "public"."Quantity_type" NOT NULL,
    "expiry_timer" TIMESTAMP(3) NOT NULL,
    "image" TEXT[],
    "freshness_status" "public"."Freshness_status" NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("post_id")
);
