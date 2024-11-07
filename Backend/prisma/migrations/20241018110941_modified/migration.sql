/*
  Warnings:

  - You are about to drop the column `submissionId` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Project` DROP FOREIGN KEY `Submission__Project`;

-- AlterTable
ALTER TABLE `Project` DROP COLUMN `submissionId`;
