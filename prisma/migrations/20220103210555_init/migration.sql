/*
  Warnings:

  - You are about to drop the column `arrival_date` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `arrived` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `delayed` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "arrival_date",
DROP COLUMN "arrived",
DROP COLUMN "delayed";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "arrival_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "arrived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "delayed" BOOLEAN NOT NULL DEFAULT false;
