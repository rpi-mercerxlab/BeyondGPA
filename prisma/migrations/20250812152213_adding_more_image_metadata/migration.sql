/*
  Warnings:

  - Added the required column `size` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external` to the `ThumbnailImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `ThumbnailImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Image" ADD COLUMN     "external" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "size" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."ThumbnailImage" ADD COLUMN     "external" BOOLEAN NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL;
