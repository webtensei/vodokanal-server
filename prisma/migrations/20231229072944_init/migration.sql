-- CreateEnum
CREATE TYPE "roles" AS ENUM ('VISITOR', 'USER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "address_type" AS ENUM ('CITIZEN', 'BUSINESS');

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
    "phone_activated_at" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "login_histories" (
    "id" SERIAL NOT NULL,
    "username" INTEGER NOT NULL,
    "login_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "username" INTEGER NOT NULL,
    "street" TEXT NOT NULL,
    "house" TEXT NOT NULL,
    "apartment" TEXT,
    "type" "address_type" NOT NULL,
    "system_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "preferred_settings" (
    "username" INTEGER NOT NULL,
    "preferred_theme" TEXT NOT NULL DEFAULT 'dark',
    "preferred_address" TEXT
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "addressId" INTEGER NOT NULL,
    "metters" TEXT[],
    "amount" TEXT NOT NULL,
    "payer" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "tokens" (
    "token" TEXT NOT NULL,
    "expired_in" TIMESTAMP(3) NOT NULL,
    "username" INTEGER NOT NULL,
    "user_agent" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "variables" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "variables_pkey" PRIMARY KEY ("key")
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
CREATE UNIQUE INDEX "preferred_settings_username_key" ON "preferred_settings"("username");

-- CreateIndex
CREATE UNIQUE INDEX "payments_id_key" ON "payments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "variables_key_key" ON "variables"("key");

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
