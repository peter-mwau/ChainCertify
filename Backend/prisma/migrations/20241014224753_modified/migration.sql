/*
  Warnings:

  - You are about to drop the column `correctOption` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `quizId` on the `QuizOption` table. All the data in the column will be lost.
  - Added the required column `questionId` to the `QuizOption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `QuizOption` DROP FOREIGN KEY `Quiz__Option`;

-- AlterTable
ALTER TABLE `Quiz` DROP COLUMN `correctOption`;

-- AlterTable
ALTER TABLE `QuizOption` DROP COLUMN `quizId`,
    ADD COLUMN `questionId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(191) NOT NULL,
    `correctOption` INTEGER NULL,
    `quizId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizOption` ADD CONSTRAINT `QuizOption_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
