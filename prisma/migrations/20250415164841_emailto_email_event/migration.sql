/*
  Warnings:

  - A unique constraint covering the columns `[emailId,emailTo]` on the table `EmailEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EmailEvent" ADD COLUMN     "emailTo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "EmailEvent_emailId_emailTo_key" ON "EmailEvent"("emailId", "emailTo");
