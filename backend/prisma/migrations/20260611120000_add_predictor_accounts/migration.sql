-- CreateTable
CREATE TABLE "predictor_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "plan" VARCHAR(20) NOT NULL DEFAULT 'free',
    "searches_limit" INTEGER NOT NULL DEFAULT 0,
    "searches_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictor_searches" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "combo_hash" VARCHAR(64) NOT NULL,
    "inputs" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictor_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictor_payments" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "razorpay_order_id" VARCHAR(255) NOT NULL,
    "razorpay_payment_id" VARCHAR(255),
    "amount" DECIMAL(10,2) NOT NULL,
    "searches_granted" INTEGER NOT NULL DEFAULT 15,
    "status" VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictor_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "predictor_profiles_user_id_key" ON "predictor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "predictor_searches_user_id_idx" ON "predictor_searches"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "predictor_searches_user_id_combo_hash_key" ON "predictor_searches"("user_id", "combo_hash");

-- CreateIndex
CREATE INDEX "predictor_payments_user_id_idx" ON "predictor_payments"("user_id");

-- CreateIndex
CREATE INDEX "predictor_payments_razorpay_order_id_idx" ON "predictor_payments"("razorpay_order_id");
