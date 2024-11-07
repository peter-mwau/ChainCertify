/*
  Warnings:

  - You are about to drop the column `fields` on the `Submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Submission` DROP COLUMN `fields`,
    ADD COLUMN `file` VARCHAR(191) NULL;
