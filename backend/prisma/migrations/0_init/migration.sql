-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."order_tracking" (
    "id" SERIAL NOT NULL,
    "order_id" UUID,
    "status" VARCHAR(50) NOT NULL,
    "message" TEXT,
    "timestamp" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" VARCHAR(255) NOT NULL,
    "product_type" VARCHAR(50) NOT NULL,
    "mode" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'INR',
    "status" VARCHAR(20) DEFAULT 'PENDING',
    "payment_id" VARCHAR(255),
    "payment_order_id" VARCHAR(255),
    "payment_signature" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "slot_id" UUID,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_history" (
    "id" SERIAL NOT NULL,
    "order_id" UUID,
    "payment_id" VARCHAR(255),
    "payment_order_id" VARCHAR(255),
    "event" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(10,2),
    "currency" VARCHAR(10) DEFAULT 'INR',
    "status" VARCHAR(20),
    "raw_response" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" VARCHAR(50) NOT NULL,
    "slot_time" TIMESTAMPTZ(6) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "booked" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT,
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "refresh_token" TEXT,
    "refresh_token_expires" TIMESTAMPTZ(6),
    "reset_token" TEXT,
    "reset_token_expires" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_order_tracking_order_id" ON "public"."order_tracking"("order_id" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_payment_order_id" ON "public"."orders"("payment_order_id" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_product_type" ON "public"."orders"("product_type" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_status" ON "public"."orders"("status" ASC);

-- CreateIndex
CREATE INDEX "idx_orders_user_id" ON "public"."orders"("user_id" ASC);

-- CreateIndex
CREATE INDEX "idx_slots_product_id" ON "public"."slots"("product_id" ASC);

-- CreateIndex
CREATE INDEX "idx_slots_slot_time" ON "public"."slots"("slot_time" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."order_tracking" ADD CONSTRAINT "order_tracking_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "public"."slots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."payment_history" ADD CONSTRAINT "payment_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

