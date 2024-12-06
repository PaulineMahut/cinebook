-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `sharedlist` DROP FOREIGN KEY `SharedList_groupId_fkey`;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SharedList` ADD CONSTRAINT `SharedList_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
