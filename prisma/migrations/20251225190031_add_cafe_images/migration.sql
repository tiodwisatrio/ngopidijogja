-- AlterTable
ALTER TABLE `cafes` ADD COLUMN `main_image_id` BIGINT NULL;

-- CreateTable
CREATE TABLE `cafe_images` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `cafe_id` BIGINT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `alt` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cafe_images` ADD CONSTRAINT `cafe_images_cafe_id_fkey` FOREIGN KEY (`cafe_id`) REFERENCES `cafes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
