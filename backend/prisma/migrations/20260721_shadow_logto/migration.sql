-- Phase 1: Shadow phone accounts
ALTER TABLE "users" ADD COLUMN "account_type" VARCHAR(20) NOT NULL DEFAULT 'registered';
ALTER TABLE "users" ADD COLUMN "shadow_expires_at" TIMESTAMPTZ;
ALTER TABLE "users" ADD COLUMN "shadow_device_token" VARCHAR(255);

-- Phase 2: Logto integration (added here to avoid a second migration run)
ALTER TABLE "users" ADD COLUMN "logto_sub" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN "avatar_url" TEXT;
CREATE UNIQUE INDEX "users_logto_sub_key" ON "users"("logto_sub") WHERE "logto_sub" IS NOT NULL;
