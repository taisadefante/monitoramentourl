-- CreateTable
CREATE TABLE "Verificacao" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "codigo" INTEGER NOT NULL,
    "mensagem" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verificacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Verificacao" ADD CONSTRAINT "Verificacao_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
