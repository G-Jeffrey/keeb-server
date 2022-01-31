/*
  Warnings:

  - The `date_of_purchase` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `arrival_date` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "date_of_purchase",
ADD COLUMN     "date_of_purchase" TIMESTAMP(3),
DROP COLUMN "arrival_date",
ADD COLUMN     "arrival_date" TIMESTAMP(3);
