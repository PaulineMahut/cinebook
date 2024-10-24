/*
  Warnings:

  - You are about to drop the column `movieId` on the `movielistitem` table. All the data in the column will be lost.
  - Added the required column `overview` to the `MovieListItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `MovieListItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tmdbId` to the `MovieListItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voteAverage` to the `MovieListItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `movielistitem` DROP FOREIGN KEY `MovieListItem_movieId_fkey`;

-- AlterTable
ALTER TABLE `movielistitem` DROP COLUMN `movieId`,
    ADD COLUMN `overview` VARCHAR(191) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL,
    ADD COLUMN `tmdbId` INTEGER NOT NULL,
    ADD COLUMN `voteAverage` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `_MovieListItemGenres` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MovieListItemGenres_AB_unique`(`A`, `B`),
    INDEX `_MovieListItemGenres_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_MovieListItemGenres` ADD CONSTRAINT `_MovieListItemGenres_A_fkey` FOREIGN KEY (`A`) REFERENCES `Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MovieListItemGenres` ADD CONSTRAINT `_MovieListItemGenres_B_fkey` FOREIGN KEY (`B`) REFERENCES `MovieListItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
