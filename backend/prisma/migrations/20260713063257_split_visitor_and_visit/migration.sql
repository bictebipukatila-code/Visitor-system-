/*
  Warnings:

  - You are about to drop the column `checkInTime` on the `visitor` table. All the data in the column will be lost.
  - You are about to drop the column `checkOutTime` on the `visitor` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `visitor` table. All the data in the column will be lost.
  - You are about to drop the column `personToVisit` on the `visitor` table. All the data in the column will be lost.
  - You are about to drop the column `purposeOfVisit` on the `visitor` table. All the data in the column will be lost.
  - You are about to drop the column `registeredById` on the `visitor` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `visitor` table. All the data in the column will be lost.
  - You are about to drop the column `visitStatus` on the `visitor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `visitor` DROP FOREIGN KEY `Visitor_registeredById_fkey`;

-- DropIndex
DROP INDEX `Visitor_registeredById_fkey` ON `visitor`;

-- AlterTable
ALTER TABLE `visitor` DROP COLUMN `checkInTime`,
    DROP COLUMN `checkOutTime`,
    DROP COLUMN `department`,
    DROP COLUMN `personToVisit`,
    DROP COLUMN `purposeOfVisit`,
    DROP COLUMN `registeredById`,
    DROP COLUMN `remarks`,
    DROP COLUMN `visitStatus`;

-- CreateTable
CREATE TABLE `Visit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `visitorId` INTEGER NOT NULL,
    `purposeOfVisit` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `personToVisit` VARCHAR(191) NOT NULL,
    `checkInTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `checkOutTime` DATETIME(3) NULL,
    `visitStatus` ENUM('CHECKED_IN', 'CHECKED_OUT') NOT NULL DEFAULT 'CHECKED_IN',
    `remarks` VARCHAR(191) NULL,
    `registeredById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Visit` ADD CONSTRAINT `Visit_visitorId_fkey` FOREIGN KEY (`visitorId`) REFERENCES `Visitor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Visit` ADD CONSTRAINT `Visit_registeredById_fkey` FOREIGN KEY (`registeredById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
