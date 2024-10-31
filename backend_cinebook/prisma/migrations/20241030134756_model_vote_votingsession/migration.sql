-- AlterTable
ALTER TABLE `notification` ADD COLUMN `votingSessionId` INTEGER NULL;

-- CreateTable
CREATE TABLE `VotingSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `movieListId` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `votingSessionId` INTEGER NOT NULL,
    `movieListItemId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_votingSessionId_fkey` FOREIGN KEY (`votingSessionId`) REFERENCES `VotingSession`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VotingSession` ADD CONSTRAINT `VotingSession_movieListId_fkey` FOREIGN KEY (`movieListId`) REFERENCES `MovieList`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_votingSessionId_fkey` FOREIGN KEY (`votingSessionId`) REFERENCES `VotingSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_movieListItemId_fkey` FOREIGN KEY (`movieListItemId`) REFERENCES `MovieListItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
