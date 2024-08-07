/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Audience` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Audience_email_key" ON "Audience"("email");
