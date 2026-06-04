ALTER TABLE "Organization"
ADD COLUMN "fromName" TEXT;

UPDATE "Organization"
SET "fromName" = NULLIF(TRIM("name"), '')
WHERE "fromName" IS NULL;
