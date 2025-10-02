-- Add unsubscribe fields to Audience
ALTER TABLE "Audience"
  ADD COLUMN "isUnsubscribed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "unsubscribedAt" TIMESTAMP(3),
  ADD COLUMN "unsubscribeReason" TEXT;

-- Index for unsubscribed status
CREATE INDEX "Audience_isUnsubscribed_idx" ON "Audience"("isUnsubscribed");
-- AddUnsubscribeFields
ALTER TABLE "Audience" ADD COLUMN "isUnsubscribed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Audience" ADD COLUMN "unsubscribedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Audience_isUnsubscribed_idx" ON "Audience"("isUnsubscribed");
