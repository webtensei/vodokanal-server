-- CreateEnum
CREATE TYPE "roles" AS ENUM ('VISITOR', 'CITIZEN', 'BUSINESS', 'ADMIN', 'SWE', 'OWNER');

-- CreateTable
CREATE TABLE "users" (
    "username" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "patronymic" TEXT,
    "role" "roles" NOT NULL DEFAULT 'VISITOR',

    CONSTRAINT "users_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "tokens" (
    "token" TEXT NOT NULL,
    "expired_in" TIMESTAMP(3) NOT NULL,
    "username" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "preferred_settings" (
    "username" INTEGER NOT NULL,
    "preferred_theme" TEXT NOT NULL DEFAULT 'dark'
);

-- CreateTable
CREATE TABLE "contacts" (
    "username" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "email_activation_code" TEXT NOT NULL,
    "email_activated" BOOLEAN NOT NULL DEFAULT false,
    "email_activated_at" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "phone_activation_code" TEXT NOT NULL,
    "phone_activated" BOOLEAN NOT NULL DEFAULT false,
    "phone_activated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "login_histories" (
    "id" SERIAL NOT NULL,
    "username" INTEGER NOT NULL,
    "login_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "login_os" TEXT,
    "login_browser" TEXT
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "username" INTEGER NOT NULL,
    "street" TEXT NOT NULL,
    "house" TEXT NOT NULL,
    "apartment" TEXT,
    "g_account_id" TEXT
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
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "preferred_settings_username_key" ON "preferred_settings"("username");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_username_key" ON "contacts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "login_histories_id_key" ON "login_histories"("id");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_id_key" ON "addresses"("id");

-- CreateIndex
CREATE UNIQUE INDEX "variables_key_key" ON "variables"("key");

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferred_settings" ADD CONSTRAINT "preferred_settings_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_histories" ADD CONSTRAINT "login_histories_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
