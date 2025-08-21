/*
  Warnings:

  - You are about to drop the column `softDeleted` on the `Project` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."ProjectVisibility" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "softDeleted";
