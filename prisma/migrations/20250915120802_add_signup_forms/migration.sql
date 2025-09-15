-- CreateTable
CREATE TABLE "SignupForm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "audienceListId" TEXT,

    CONSTRAINT "SignupForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignupFormField" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "placeholder" TEXT,
    "options" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "validation" JSONB,
    "signupFormId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignupFormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignupSubmission" (
    "id" TEXT NOT NULL,
    "formData" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signupFormId" TEXT NOT NULL,
    "audienceId" TEXT,

    CONSTRAINT "SignupSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SignupForm_organizationId_idx" ON "SignupForm"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SignupForm_slug_organizationId_key" ON "SignupForm"("slug", "organizationId");

-- CreateIndex
CREATE INDEX "SignupFormField_signupFormId_idx" ON "SignupFormField"("signupFormId");

-- CreateIndex
CREATE INDEX "SignupSubmission_signupFormId_idx" ON "SignupSubmission"("signupFormId");

-- CreateIndex
CREATE INDEX "SignupSubmission_audienceId_idx" ON "SignupSubmission"("audienceId");

-- AddForeignKey
ALTER TABLE "SignupForm" ADD CONSTRAINT "SignupForm_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupForm" ADD CONSTRAINT "SignupForm_audienceListId_fkey" FOREIGN KEY ("audienceListId") REFERENCES "AudienceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupFormField" ADD CONSTRAINT "SignupFormField_signupFormId_fkey" FOREIGN KEY ("signupFormId") REFERENCES "SignupForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupSubmission" ADD CONSTRAINT "SignupSubmission_signupFormId_fkey" FOREIGN KEY ("signupFormId") REFERENCES "SignupForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupSubmission" ADD CONSTRAINT "SignupSubmission_audienceId_fkey" FOREIGN KEY ("audienceId") REFERENCES "Audience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
