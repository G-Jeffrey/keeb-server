/*
  Warnings:

  - You are about to drop the column `number_of_items` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "number_of_items",
ADD COLUMN     "items" INTEGER NOT NULL DEFAULT 0;
