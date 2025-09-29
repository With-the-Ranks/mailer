-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "segmentId" TEXT,
ALTER COLUMN "audienceListId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
