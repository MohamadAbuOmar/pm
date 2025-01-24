-- CreateIndex
CREATE INDEX `calls_start_date_idx` ON `calls`(`start_date`);

-- CreateIndex
CREATE INDEX `calls_end_date_idx` ON `calls`(`end_date`);

-- CreateIndex
CREATE INDEX `calls_insert_date_idx` ON `calls`(`insert_date`);

-- CreateIndex
CREATE INDEX `calls_call_name_idx` ON `calls`(`call_name`(191));

-- CreateIndex
CREATE INDEX `donors_donors_is_partner_idx` ON `donors`(`donors_is_partner`);

-- CreateIndex
CREATE INDEX `donors_created_at_idx` ON `donors`(`created_at`);

-- CreateIndex
CREATE INDEX `donors_donors_english_name_idx` ON `donors`(`donors_english_name`(191));

-- CreateIndex
CREATE INDEX `donors_donors_arabic_name_idx` ON `donors`(`donors_arabic_name`(191));

-- CreateIndex
CREATE INDEX `donors_categories_createdAt_idx` ON `donors_categories`(`createdAt`);

-- CreateIndex
CREATE INDEX `regions_regions_name_idx` ON `regions`(`regions_name`(191));

-- CreateIndex
CREATE INDEX `regions_created_at_idx` ON `regions`(`created_at`);
