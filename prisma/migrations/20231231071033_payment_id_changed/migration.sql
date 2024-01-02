/*
  Warnings:

  - You are about to drop the column `id` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[payment_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "payments_id_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_id_key" ON "payments"("payment_id");
