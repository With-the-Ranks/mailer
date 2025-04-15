/*
  Warnings:

  - A unique constraint covering the columns `[emailId,emailTo,eventType]` on the table `EmailEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EmailEvent_emailId_emailTo_key";

-- CreateIndex
CREATE UNIQUE INDEX "EmailEvent_emailId_emailTo_eventType_key" ON "EmailEvent"("emailId", "emailTo", "eventType");
