-- AlterTable
ALTER TABLE "Verificacao" ADD COLUMN     "erroSeo" TEXT,
ADD COLUMN     "scoreSeguranca" TEXT,
ADD COLUMN     "scoreSeo" TEXT,
ADD COLUMN     "tamanhoHtmlKb" INTEGER,
ADD COLUMN     "totalImagens" INTEGER,
ADD COLUMN     "totalLinks" INTEGER;
