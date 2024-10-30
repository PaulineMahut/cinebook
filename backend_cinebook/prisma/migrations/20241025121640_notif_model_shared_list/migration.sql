-- AlterTable
ALTER TABLE `notification` ADD COLUMN `listId` INTEGER NULL;

-- AlterTable
ALTER TABLE `sharedlist` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `MovieList`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
