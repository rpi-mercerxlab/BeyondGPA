/*
  Warnings:

  - A unique constraint covering the columns `[rcsid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `rcsid` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "rcsid" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_rcsid_key" ON "User"("rcsid");
