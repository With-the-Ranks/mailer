/*
  Warnings:

  - A unique constraint covering the columns `[activeDomainId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "activeDomainId" TEXT,
ADD COLUMN     "emailApiKey" TEXT;

-- CreateTable
CREATE TABLE "EmailDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'resend',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailDomain_domain_key" ON "EmailDomain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_activeDomainId_key" ON "Organization"("activeDomainId");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_activeDomainId_fkey" FOREIGN KEY ("activeDomainId") REFERENCES "EmailDomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailDomain" ADD CONSTRAINT "EmailDomain_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
