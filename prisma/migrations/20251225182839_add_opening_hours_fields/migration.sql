-- AlterTable
ALTER TABLE `opening_hours` ADD COLUMN `is_everyday_open` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_open_24_hours` BOOLEAN NOT NULL DEFAULT false;
