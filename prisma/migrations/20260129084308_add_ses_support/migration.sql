-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "providerUsed" TEXT DEFAULT 'ses',
ADD COLUMN     "sesMessageId" TEXT;

-- AlterTable
ALTER TABLE "EmailDomain" ADD COLUMN     "awsRegion" TEXT DEFAULT 'us-east-1',
ADD COLUMN     "clickTracking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dkimPublicKey" TEXT,
ADD COLUMN     "dkimSelector" TEXT DEFAULT 'mailer',
ADD COLUMN     "dkimStatus" TEXT,
ADD COLUMN     "openTracking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spfStatus" TEXT,
ALTER COLUMN "provider" SET DEFAULT 'ses';

-- CreateTable
CREATE TABLE "SesRegionSettings" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "topicArn" TEXT,
    "configGeneral" TEXT,
    "configClick" TEXT,
    "configOpen" TEXT,
    "configFull" TEXT,
    "emailRateLimit" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SesRegionSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSuppression" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "sourceEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailSuppression_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SesRegionSettings_region_key" ON "SesRegionSettings"("region");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSuppression_email_key" ON "EmailSuppression"("email");

-- CreateIndex
CREATE INDEX "EmailSuppression_email_idx" ON "EmailSuppression"("email");

-- CreateIndex
CREATE INDEX "Email_sesMessageId_idx" ON "Email"("sesMessageId");
