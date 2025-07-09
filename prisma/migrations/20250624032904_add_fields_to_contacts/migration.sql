-- AlterTable
ALTER TABLE "Audience" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "defaultAddressAddress1" TEXT,
ADD COLUMN     "defaultAddressAddress2" TEXT,
ADD COLUMN     "defaultAddressCity" TEXT,
ADD COLUMN     "defaultAddressCompany" TEXT,
ADD COLUMN     "defaultAddressCountryCode" TEXT,
ADD COLUMN     "defaultAddressPhone" TEXT,
ADD COLUMN     "defaultAddressProvinceCode" TEXT,
ADD COLUMN     "defaultAddressZip" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "tags" TEXT;

-- CreateTable
CREATE TABLE "CustomFieldDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" TEXT[],
    "required" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomFieldDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomFieldDefinition_organizationId_idx" ON "CustomFieldDefinition"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldDefinition_organizationId_name_key" ON "CustomFieldDefinition"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Audience_audienceListId_idx" ON "Audience"("audienceListId");

-- CreateIndex
CREATE INDEX "Audience_email_idx" ON "Audience"("email");

-- CreateIndex
CREATE INDEX "Audience_firstName_lastName_idx" ON "Audience"("firstName", "lastName");

-- AddForeignKey
ALTER TABLE "CustomFieldDefinition" ADD CONSTRAINT "CustomFieldDefinition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
