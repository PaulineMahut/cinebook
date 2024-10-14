-- CreateTable
CREATE TABLE `Genre` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MovieGenres` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MovieGenres_AB_unique`(`A`, `B`),
    INDEX `_MovieGenres_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_MovieGenres` ADD CONSTRAINT `_MovieGenres_A_fkey` FOREIGN KEY (`A`) REFERENCES `Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MovieGenres` ADD CONSTRAINT `_MovieGenres_B_fkey` FOREIGN KEY (`B`) REFERENCES `Movie`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
