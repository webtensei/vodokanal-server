-- CreateEnum
CREATE TYPE "roles" AS ENUM ('VISITOR', 'USER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "address_type" AS ENUM ('CITIZEN', 'BUSINESS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('waiting_for_capture', 'pending', 'succeeded', 'canceled');

-- CreateTable
CREATE TABLE "users" (
    "username" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "patronymic" TEXT,
    "role" "roles" NOT NULL DEFAULT 'USER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "contacts" (
    "username" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "email_activated" BOOLEAN NOT NULL DEFAULT false,
    "email_activated_at" TIMESTAMP(3),
    "phone" TEXT NOT NULL,
    "phone_activated" BOOLEAN NOT NULL DEFAULT false,
    "phone_activated_at" TIMESTAMP(3),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "login_histories" (
    "id" TEXT NOT NULL,
    "username" INTEGER NOT NULL,
    "login_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,

    CONSTRAINT "login_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "username" INTEGER NOT NULL,
    "street" TEXT NOT NULL,
    "house" TEXT NOT NULL,
    "apartment" TEXT,
    "type" "address_type" NOT NULL,
    "system_id" TEXT NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "street_map" (
    "name" TEXT NOT NULL,
    "grad_id" TEXT,

    CONSTRAINT "street_map_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "preferred_settings" (
    "username" INTEGER NOT NULL,
    "preferred_theme" TEXT NOT NULL DEFAULT 'dark',
    "preferred_address" TEXT,

    CONSTRAINT "preferred_settings_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "meters" TEXT[],
    "services" TEXT[],
    "amount" TEXT NOT NULL,
    "payer" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expired_in" TIMESTAMP(3) NOT NULL,
    "username" INTEGER NOT NULL,
    "user_agent" TEXT NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_username_key" ON "contacts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "login_histories_id_key" ON "login_histories"("id");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_id_key" ON "addresses"("id");

-- CreateIndex
CREATE UNIQUE INDEX "street_map_name_key" ON "street_map"("name");

-- CreateIndex
CREATE UNIQUE INDEX "preferred_settings_username_key" ON "preferred_settings"("username");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_id_key" ON "payments"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_histories" ADD CONSTRAINT "login_histories_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferred_settings" ADD CONSTRAINT "preferred_settings_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE CASCADE ON UPDATE CASCADE;
