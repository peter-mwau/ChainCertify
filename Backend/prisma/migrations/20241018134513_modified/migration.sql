-- DropForeignKey
ALTER TABLE `Grading` DROP FOREIGN KEY `Submission__Grading`;

-- AlterTable
ALTER TABLE `Grading` ADD COLUMN `projectId` INTEGER NULL,
    MODIFY `submissionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Grading` ADD CONSTRAINT `Submission__Grading` FOREIGN KEY (`submissionId`) REFERENCES `Submission`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grading` ADD CONSTRAINT `Project__Grading` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
