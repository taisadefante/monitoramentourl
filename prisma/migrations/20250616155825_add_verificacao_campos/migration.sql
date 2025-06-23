-- AlterTable
ALTER TABLE "Verificacao" ADD COLUMN     "hash" TEXT,
ADD COLUMN     "screenshot" TEXT,
ADD COLUMN     "temHttps" BOOLEAN,
ADD COLUMN     "tempoCarregamentoMs" INTEGER;
