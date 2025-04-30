/*
  Warnings:

  - You are about to alter the column `provider` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `providerId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "provider" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "providerId" SET DATA TYPE VARCHAR(255);
