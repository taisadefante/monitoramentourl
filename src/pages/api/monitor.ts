// pages/api/monitor.ts (atualizado)
import { prisma } from "@/lib/prisma";
import { verificarSite } from "@/lib/monitorUtils";
import { registrarAlerta } from "@/lib/notifier";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const sites = await prisma.site.findMany();
    const resultados = [];

    for (const site of sites) {
      const resultado = await verificarSite(site.url);

      console.log("🔍 Verificação de:", site.url);
      console.log("Resultado:", resultado);

      let statusFinal = "erro";
      const mensagem = resultado?.mensagem ?? "Erro desconhecido";
      const codigo = resultado?.codigo ?? 0;

      if (resultado.status === "ok") {
        statusFinal =
          site.hashAtual && site.hashAtual !== resultado.hash
            ? "alterado"
            : "ok";

        await prisma.site.update({
          where: { id: site.id },
          data: {
            status: statusFinal,
            ultimoCheck: new Date(),
            hashAtual: resultado.hash,
          },
        });
      } else {
        await prisma.site.update({
          where: { id: site.id },
          data: {
            status: "erro",
            ultimoCheck: new Date(),
          },
        });
      }

      try {
        await prisma.verificacao.create({
          data: {
            siteId: site.id,
            status: statusFinal,
            codigo,
            mensagem,
            hash: resultado.hash ?? null,
            tempoCarregamentoMs: resultado.tempoCarregamentoMs ?? null,
            temHttps: resultado.temHttps ?? null,
            screenshot: resultado.screenshot ?? null,
          },
        });
      } catch (e) {
        console.error("❌ Erro ao salvar verificação no banco:", e);
      }

      if (statusFinal === "erro" || statusFinal === "alterado") {
        try {
          await registrarAlerta({
            siteId: site.id,
            url: site.url,
            mensagem:
              statusFinal === "erro"
                ? "Site fora do ar ou com erro."
                : "Conteúdo do site foi alterado.",
            tipo: statusFinal,
          });
        } catch (e) {
          console.error("❌ Erro ao registrar alerta:", e);
        }
      }

      resultados.push({
        id: site.id,
        nome: site.nome,
        url: site.url,
        status: statusFinal,
        mensagem,
        codigo,
        hash: resultado.hash ?? "-",
        tempoCarregamentoMs: resultado.tempoCarregamentoMs ?? 0,
        temHttps: resultado.temHttps ?? false,
        screenshot: resultado.screenshot ?? null,
        headers: resultado.headers ?? {},
        html: resultado.html ?? "",
        imagens: resultado.imagens ?? [],
        ip: resultado.ip ?? "-",
        host: resultado.host ?? "-",
        geoLocation: resultado.geoLocation ?? "-",
        techStack: resultado.techStack ?? [],
        description: resultado.description ?? "-",
        malware: resultado.malware ?? [], // <<< aqui
      });
    }

    return res.status(200).json({ resultados });
  } catch (err) {
    console.error("❌ Erro geral no monitoramento:", err);
    return res.status(500).json({ erro: "Erro ao monitorar sites." });
  }
}
