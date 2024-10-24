/*
  Warnings:

  - You are about to drop the `_movielistitemgenres` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_movielistitemgenres` DROP FOREIGN KEY `_MovieListItemGenres_A_fkey`;

-- DropForeignKey
ALTER TABLE `_movielistitemgenres` DROP FOREIGN KEY `_MovieListItemGenres_B_fkey`;

-- DropTable
DROP TABLE `_movielistitemgenres`;
