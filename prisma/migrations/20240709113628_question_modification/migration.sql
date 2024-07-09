/*
  Warnings:

  - You are about to drop the column `execQueId` on the `Code` table. All the data in the column will be lost.
  - You are about to drop the `IO` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[questionId]` on the table `TestCase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questionId` to the `ExampleTestCase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Code" DROP CONSTRAINT "Code_execQueId_fkey";

-- DropForeignKey
ALTER TABLE "Code" DROP CONSTRAINT "Code_solQueId_fkey";

-- DropForeignKey
ALTER TABLE "IO" DROP CONSTRAINT "IO_inputQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "IO" DROP CONSTRAINT "IO_outputQuestionId_fkey";

-- AlterTable
ALTER TABLE "Code" DROP COLUMN "execQueId";

-- AlterTable
ALTER TABLE "ExampleTestCase" ADD COLUMN     "questionId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "IO";

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_questionId_key" ON "TestCase"("questionId");

-- AddForeignKey
ALTER TABLE "ExampleTestCase" ADD CONSTRAINT "ExampleTestCase_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_solQueId_fkey" FOREIGN KEY ("solQueId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
