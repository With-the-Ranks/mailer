/*
  Warnings:

  - A unique constraint covering the columns `[audienceListId,email]` on the table `Audience` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Audience_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "Audience_audienceListId_email_key" ON "Audience"("audienceListId", "email");
