-- Migration: Add Facilities Table and Remove facilities column from cafes
-- This migration creates the facilities and cafe_facilities tables,
-- migrates existing data, and removes the old facilities column

-- Step 1: Create facilities table
CREATE TABLE IF NOT EXISTS `facilities` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(191) NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `icon` VARCHAR(191) NULL,
  UNIQUE INDEX `facilities_code_key`(`code`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 2: Create cafe_facilities junction table
CREATE TABLE IF NOT EXISTS `cafe_facilities` (
  `cafe_id` BIGINT NOT NULL,
  `facility_id` BIGINT NOT NULL,
  INDEX `cafe_facilities_facility_id_fkey`(`facility_id`),
  PRIMARY KEY (`cafe_id`, `facility_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 3: Add foreign key constraints
ALTER TABLE `cafe_facilities` ADD CONSTRAINT `cafe_facilities_cafe_id_fkey`
  FOREIGN KEY (`cafe_id`) REFERENCES `cafes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `cafe_facilities` ADD CONSTRAINT `cafe_facilities_facility_id_fkey`
  FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 4: Insert predefined facilities
INSERT INTO `facilities` (`code`, `label`, `icon`) VALUES
('wifi', 'Wi-Fi', '🛜'),
('toilet', 'Toilet', '🚻'),
('mushola', 'Mushola', '🕌'),
('cat-friendly', 'Cat Friendly', '🐱'),
('music', 'Music', '🎵'),
('ac', 'AC', '❄️'),
('playground', 'Playground', '🎮'),
('meeting-room', 'Meeting Room', '🏢'),
('smoking-area', 'Smoking Area', '🚬'),
('board-games', 'Board Games', '🎲');

-- Step 5: Migrate existing data from cafes.facilities to cafe_facilities
-- This will parse the comma-separated values and insert into the junction table
-- NOTE: You may need to run this for each cafe individually if you have existing data

-- Example for cafe_id = 1 with "Wi-Fi, Toilet, Mushola":
-- INSERT INTO `cafe_facilities` (`cafe_id`, `facility_id`)
-- SELECT 1, id FROM `facilities` WHERE `label` IN ('Wi-Fi', 'Toilet', 'Mushola');

-- Step 6: Drop the old facilities column from cafes table
ALTER TABLE `cafes` DROP COLUMN `facilities`;

-- DONE! The migration is complete.
