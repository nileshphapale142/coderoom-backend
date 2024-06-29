/*
  Warnings:

  - You are about to drop the column `Name` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `dateTime` on the `Test` table. All the data in the column will be lost.
  - Added the required column `name` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Test" DROP COLUMN "Name",
DROP COLUMN "dateTime",
ADD COLUMN     "name" TEXT NOT NULL;
