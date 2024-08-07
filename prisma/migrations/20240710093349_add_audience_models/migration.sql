-- CreateTable
CREATE TABLE "AudienceList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "AudienceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audience" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "audienceListId" TEXT NOT NULL,

    CONSTRAINT "Audience_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AudienceList" ADD CONSTRAINT "AudienceList_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audience" ADD CONSTRAINT "Audience_audienceListId_fkey" FOREIGN KEY ("audienceListId") REFERENCES "AudienceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
