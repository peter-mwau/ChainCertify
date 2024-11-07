/*
  Warnings:

  - You are about to drop the column `quizAttemptId` on the `Grading` table. All the data in the column will be lost.
  - Added the required column `assignmentId` to the `Grading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feedback` to the `Grading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `Grading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Grading` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Grading` DROP FOREIGN KEY `QuizAttempt__Grading`;

-- AlterTable
ALTER TABLE `Grading` DROP COLUMN `quizAttemptId`,
    ADD COLUMN `assignmentId` INTEGER NOT NULL,
    ADD COLUMN `feedback` VARCHAR(191) NOT NULL,
    ADD COLUMN `grade` INTEGER NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `_GradingToQuizAttempt` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GradingToQuizAttempt_AB_unique`(`A`, `B`),
    INDEX `_GradingToQuizAttempt_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Grading` ADD CONSTRAINT `Grading_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GradingToQuizAttempt` ADD CONSTRAINT `_GradingToQuizAttempt_A_fkey` FOREIGN KEY (`A`) REFERENCES `Grading`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GradingToQuizAttempt` ADD CONSTRAINT `_GradingToQuizAttempt_B_fkey` FOREIGN KEY (`B`) REFERENCES `QuizAttempt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
