-- AlterTable
ALTER TABLE `ContactMessage`
    ADD COLUMN `replyMessage` TEXT NULL,
    ADD COLUMN `repliedAt` DATETIME(3) NULL;
