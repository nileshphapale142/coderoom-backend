/*
  Warnings:

  - You are about to drop the column `solution` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `templateCode` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "solution",
DROP COLUMN "templateCode";

-- CreateTable
CREATE TABLE "Code" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "solQueId" INTEGER NOT NULL,
    "execQueId" INTEGER NOT NULL,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_solQueId_fkey" FOREIGN KEY ("solQueId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_execQueId_fkey" FOREIGN KEY ("execQueId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
