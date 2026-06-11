-- CreateTable
CREATE TABLE "analytics_events" (
    "id" BIGSERIAL NOT NULL,
    "event" VARCHAR(64) NOT NULL,
    "props" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_event_idx" ON "analytics_events"("event");
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events"("created_at");
