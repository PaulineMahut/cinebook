-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_User_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_Sender_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
