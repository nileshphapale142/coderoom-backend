-- DropForeignKey
ALTER TABLE "Code" DROP CONSTRAINT "Code_execQueId_fkey";

-- DropForeignKey
ALTER TABLE "Code" DROP CONSTRAINT "Code_solQueId_fkey";

-- AlterTable
ALTER TABLE "Code" ALTER COLUMN "solQueId" DROP NOT NULL,
ALTER COLUMN "execQueId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "IO" ALTER COLUMN "inputQuestionId" DROP NOT NULL,
ALTER COLUMN "outputQuestionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_solQueId_fkey" FOREIGN KEY ("solQueId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_execQueId_fkey" FOREIGN KEY ("execQueId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
