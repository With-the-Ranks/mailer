-- AlterTable
ALTER TABLE "Organization"
ADD COLUMN "backgroundColor" TEXT DEFAULT '#ffffff',
ADD COLUMN "buttonColor" TEXT DEFAULT '#1547E6';

-- Backfill existing rows to keep branding values present for older organizations
UPDATE "Organization"
SET
  "backgroundColor" = COALESCE("backgroundColor", '#ffffff'),
  "buttonColor" = COALESCE("buttonColor", '#1547E6');

