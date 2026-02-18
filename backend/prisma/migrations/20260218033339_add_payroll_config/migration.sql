-- CreateTable
CREATE TABLE "tax_slabs" (
    "id" TEXT NOT NULL,
    "regime" TEXT NOT NULL DEFAULT 'new',
    "min_income" DECIMAL(65,30) NOT NULL,
    "max_income" DECIMAL(65,30),
    "rate" DECIMAL(65,30) NOT NULL,
    "cess" DECIMAL(65,30) NOT NULL DEFAULT 0.04,
    "ageGroup" TEXT NOT NULL DEFAULT 'general',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_slabs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statutory_components" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "employee_rate" DECIMAL(65,30) NOT NULL,
    "employer_rate" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "min_limit" DECIMAL(65,30),
    "max_limit" DECIMAL(65,30),
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statutory_components_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "statutory_components_name_key" ON "statutory_components"("name");
