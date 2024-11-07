-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `deadline` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `assignmentId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quiz` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `totalQuestions` INTEGER NOT NULL,
    `correctOption` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuizOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `text` VARCHAR(191) NOT NULL,
    `quizId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuizAttempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `score` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `quizId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `githubLink` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `assignmentId` INTEGER NOT NULL,
    `submissionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grading` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `submissionId` INTEGER NOT NULL,
    `quizAttemptId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `Assignment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizOption` ADD CONSTRAINT `Quiz__Option` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizAttempt` ADD CONSTRAINT `QuizAttempt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuizAttempt` ADD CONSTRAINT `Quiz__QuizAttempt` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `User__Project` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Assignment__Project` FOREIGN KEY (`assignmentId`) REFERENCES `Assignment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Submission__Project` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grading` ADD CONSTRAINT `Submission__Grading` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grading` ADD CONSTRAINT `QuizAttempt__Grading` FOREIGN KEY (`quizAttemptId`) REFERENCES `QuizAttempt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
