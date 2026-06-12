-- CreateTable
CREATE TABLE "predictor_leads" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "percentile" DECIMAL(6,3),
    "category" VARCHAR(10),
    "branches" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictor_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "predictor_leads_phone_idx" ON "predictor_leads"("phone");
