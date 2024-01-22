-- CreateTable
CREATE TABLE "street_map" (
    "name" TEXT NOT NULL,
    "grad_id" INTEGER NOT NULL,

    CONSTRAINT "street_map_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "street_map_name_key" ON "street_map"("name");
