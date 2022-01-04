/*
  Warnings:

  - Added the required column `item_price` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "item_price" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "number_of_items" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "cost" SET DEFAULT 0.00,
ALTER COLUMN "tax" SET DEFAULT 0.00,
ALTER COLUMN "shipping" SET DEFAULT 0.00,
ALTER COLUMN "savings" SET DEFAULT 0.00;
