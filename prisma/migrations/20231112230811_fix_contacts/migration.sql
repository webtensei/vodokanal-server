-- AlterTable
ALTER TABLE "contacts" ALTER COLUMN "email_activation_code" DROP NOT NULL,
ALTER COLUMN "email_activation_code" SET DEFAULT '',
ALTER COLUMN "email_activated_at" DROP NOT NULL,
ALTER COLUMN "phone_activation_code" DROP NOT NULL,
ALTER COLUMN "phone_activation_code" SET DEFAULT '',
ALTER COLUMN "phone_activated_at" DROP NOT NULL;
