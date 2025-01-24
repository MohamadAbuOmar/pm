-- CreateTable
CREATE TABLE `regions` (
    `regions_id` INTEGER NOT NULL AUTO_INCREMENT,
    `regions_name` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`regions_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calls` (
    `call_id` INTEGER NOT NULL AUTO_INCREMENT,
    `call_name` TEXT NOT NULL,
    `call_focal_point` TEXT NULL,
    `call_budjet` TEXT NULL,
    `call_currency` TEXT NOT NULL,
    `doner_contribution` TEXT NULL,
    `uawc_contribution` TEXT NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `insert_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `insert_user_id` INTEGER NOT NULL,
    `donors_id` INTEGER NOT NULL,

    INDEX `calls_donors_id_idx`(`donors_id`),
    INDEX `calls_insert_user_id_idx`(`insert_user_id`),
    PRIMARY KEY (`call_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `donors_donors_regions_id_idx` ON `donors`(`donors_regions_id`);

-- AddForeignKey
ALTER TABLE `donors` ADD CONSTRAINT `donors_donors_regions_id_fkey` FOREIGN KEY (`donors_regions_id`) REFERENCES `regions`(`regions_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calls` ADD CONSTRAINT `calls_donors_id_fkey` FOREIGN KEY (`donors_id`) REFERENCES `donors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calls` ADD CONSTRAINT `calls_insert_user_id_fkey` FOREIGN KEY (`insert_user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
