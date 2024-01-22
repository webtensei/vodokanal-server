/*
  Warnings:

  - You are about to drop the column `metters` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "metters",
ADD COLUMN     "meters" TEXT[],
ADD COLUMN     "services" TEXT[];
