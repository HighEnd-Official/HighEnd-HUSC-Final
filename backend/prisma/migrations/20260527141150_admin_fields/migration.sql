/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'order pending';

-- AlterTable
ALTER TABLE `product` ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `costCents` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `coverImageUrl` VARCHAR(191) NULL,
    ADD COLUMN `sku` VARCHAR(191) NULL,
    ADD COLUMN `stock` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX `Product_sku_key` ON `Product`(`sku`);
