-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "from" TEXT,
ADD COLUMN     "previewText" TEXT,
ADD COLUMN     "replyTo" TEXT,
ADD COLUMN     "subject" TEXT,
ADD COLUMN     "to" TEXT;
