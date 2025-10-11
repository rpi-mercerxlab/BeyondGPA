/*
  Warnings:

  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ProfileVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "public"."ProfileImageType" AS ENUM ('DEFAULT', 'LINK', 'UPLOADED');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "department";

-- CreateTable
CREATE TABLE "public"."Profile" (
    "userId" TEXT NOT NULL,
    "preferredFirstName" TEXT NOT NULL,
    "preferredLastName" TEXT NOT NULL,
    "bio" VARCHAR(400) NOT NULL DEFAULT '',
    "description" VARCHAR(5000) NOT NULL DEFAULT '',
    "visibility" "public"."ProfileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."Education" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "institution" TEXT NOT NULL DEFAULT 'Rensselaer Polytechnic Institute',
    "degreeType" TEXT NOT NULL DEFAULT '',
    "degreeName" TEXT NOT NULL DEFAULT '',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfessionalExperience" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "ongoing" BOOLEAN NOT NULL DEFAULT false,
    "description" VARCHAR(5000) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ResearchExperience" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "ongoing" BOOLEAN NOT NULL DEFAULT false,
    "description" VARCHAR(5000) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfilePicture" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "imageType" "public"."ProfileImageType" NOT NULL DEFAULT 'DEFAULT',
    "imageId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfilePicture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfileLink" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfilePicture_profileId_key" ON "public"."ProfilePicture"("profileId");

-- AddForeignKey
ALTER TABLE "public"."Education" ADD CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfessionalExperience" ADD CONSTRAINT "ProfessionalExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResearchExperience" ADD CONSTRAINT "ResearchExperience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfilePicture" ADD CONSTRAINT "ProfilePicture_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfileLink" ADD CONSTRAINT "ProfileLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
