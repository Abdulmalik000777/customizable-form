-- AlterTable
ALTER TABLE `question` ADD COLUMN `maxLength` INTEGER NULL,
    ADD COLUMN `maxValue` DOUBLE NULL,
    ADD COLUMN `minLength` INTEGER NULL,
    ADD COLUMN `minValue` DOUBLE NULL,
    ADD COLUMN `regex` VARCHAR(191) NULL;
