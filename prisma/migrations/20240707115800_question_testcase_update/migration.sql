/*
  Warnings:

  - You are about to drop the `StudnetSubmission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `questionId` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StudnetSubmission" DROP CONSTRAINT "StudnetSubmission_questionId_fkey";

-- DropForeignKey
ALTER TABLE "StudnetSubmission" DROP CONSTRAINT "StudnetSubmission_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "StudnetSubmission" DROP CONSTRAINT "StudnetSubmission_userId_fkey";

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "questionId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "StudnetSubmission";

-- CreateTable
CREATE TABLE "StudentSubmission" (
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "submissionId" INTEGER NOT NULL,

    CONSTRAINT "StudentSubmission_pkey" PRIMARY KEY ("userId","questionId","submissionId")
);

-- CreateTable
CREATE TABLE "IO" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inputQuestionId" INTEGER NOT NULL,
    "outputQuestionId" INTEGER NOT NULL,

    CONSTRAINT "IO_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IO_inputQuestionId_outputQuestionId_key" ON "IO"("inputQuestionId", "outputQuestionId");

-- AddForeignKey
ALTER TABLE "StudentSubmission" ADD CONSTRAINT "StudentSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubmission" ADD CONSTRAINT "StudentSubmission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubmission" ADD CONSTRAINT "StudentSubmission_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IO" ADD CONSTRAINT "IO_inputQuestionId_fkey" FOREIGN KEY ("inputQuestionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IO" ADD CONSTRAINT "IO_outputQuestionId_fkey" FOREIGN KEY ("outputQuestionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
