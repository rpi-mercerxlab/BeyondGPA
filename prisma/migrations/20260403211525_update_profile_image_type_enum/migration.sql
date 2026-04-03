/*
  Warnings:

  - The values [DEFAULT] on the enum `ProfileImageType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `piName` to the `ResearchExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `researchGroup` to the `ResearchExperience` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProfileImageType_new" AS ENUM ('LINK', 'UPLOADED');
ALTER TABLE "public"."ProfilePicture" ALTER COLUMN "imageType" DROP DEFAULT;
ALTER TABLE "ProfilePicture" ALTER COLUMN "imageType" TYPE "ProfileImageType_new" USING ("imageType"::text::"ProfileImageType_new");
ALTER TYPE "ProfileImageType" RENAME TO "ProfileImageType_old";
ALTER TYPE "ProfileImageType_new" RENAME TO "ProfileImageType";
DROP TYPE "public"."ProfileImageType_old";
ALTER TABLE "ProfilePicture" ALTER COLUMN "imageType" SET DEFAULT 'LINK';
COMMIT;

-- AlterTable
ALTER TABLE "ProfilePicture" ALTER COLUMN "imageType" SET DEFAULT 'LINK';

-- AlterTable
ALTER TABLE "ResearchExperience" ADD COLUMN     "piName" TEXT NOT NULL,
ADD COLUMN     "researchGroup" TEXT NOT NULL;
