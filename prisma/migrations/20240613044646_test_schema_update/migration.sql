/*
  Warnings:

  - Added the required column `Name` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateTime` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visibility` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "Name" TEXT NOT NULL,
ADD COLUMN     "courseId" INTEGER NOT NULL,
ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visibility" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
