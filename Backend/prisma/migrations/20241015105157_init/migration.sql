-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_quizId_fkey`;

-- DropForeignKey
ALTER TABLE `QuizOption` DROP FOREIGN KEY `QuizOption_questionId_fkey`;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizOption` ADD CONSTRAINT `QuizOption_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
