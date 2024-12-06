-- DropForeignKey
ALTER TABLE `groupmembership` DROP FOREIGN KEY `GroupMembership_groupId_fkey`;

-- AddForeignKey
ALTER TABLE `GroupMembership` ADD CONSTRAINT `GroupMembership_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
