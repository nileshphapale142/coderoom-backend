/*
  Warnings:

  - Added the required column `availablePoints` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN "availablePoints" INTEGER;

-- Update the existing rows to set the new column's value to match the "points" column
UPDATE "Question" SET "availablePoints" = "points";