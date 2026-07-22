-- Phase 1: Shadow phone accounts + Phase 2: Logto integration
-- IF NOT EXISTS guards make this idempotent if columns were applied manually first.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "account_type" VARCHAR(20) NOT NULL DEFAULT 'registered';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "shadow_expires_at" TIMESTAMPTZ;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "shadow_device_token" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "logto_sub" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "users_logto_sub_key" ON "users"("logto_sub") WHERE "logto_sub" IS NOT NULL;
