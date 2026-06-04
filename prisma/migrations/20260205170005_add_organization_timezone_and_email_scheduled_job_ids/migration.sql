-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "scheduledJobIds" JSONB;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "timezone" TEXT DEFAULT 'America/New_York';
