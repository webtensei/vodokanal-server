/*
  Warnings:

  - The values [GRAD,UKEK] on the enum `address_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "address_type_new" AS ENUM ('CITIZEN', 'BUSINESS');
ALTER TABLE "addresses" ALTER COLUMN "type" TYPE "address_type_new" USING ("type"::text::"address_type_new");
ALTER TYPE "address_type" RENAME TO "address_type_old";
ALTER TYPE "address_type_new" RENAME TO "address_type";
DROP TYPE "address_type_old";
COMMIT;
