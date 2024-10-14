/*
  Warnings:

  - You are about to drop the `genre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `moviegenre` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `moviegenre` DROP FOREIGN KEY `MovieGenre_genreId_fkey`;

-- DropForeignKey
ALTER TABLE `moviegenre` DROP FOREIGN KEY `MovieGenre_movieId_fkey`;

-- DropTable
DROP TABLE `genre`;

-- DropTable
DROP TABLE `moviegenre`;
