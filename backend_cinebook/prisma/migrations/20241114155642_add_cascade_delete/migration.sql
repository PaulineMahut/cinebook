-- DropForeignKey
ALTER TABLE `movielistitem` DROP FOREIGN KEY `MovieListItem_listId_fkey`;

-- DropForeignKey
ALTER TABLE `sharedlist` DROP FOREIGN KEY `SharedList_listId_fkey`;

-- DropForeignKey
ALTER TABLE `votingsession` DROP FOREIGN KEY `VotingSession_movieListId_fkey`;

-- AlterTable
ALTER TABLE `votingsession` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `MovieListItem` ADD CONSTRAINT `MovieListItem_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `MovieList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SharedList` ADD CONSTRAINT `SharedList_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `MovieList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VotingSession` ADD CONSTRAINT `VotingSession_movieListId_fkey` FOREIGN KEY (`movieListId`) REFERENCES `MovieList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
