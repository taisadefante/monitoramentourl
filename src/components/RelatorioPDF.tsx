import { analisarSeo } from "@/lib/seoCheck";
import { avaliarSeguranca } from "@/lib/securityCheck";

interface RelatorioData {
  nome: string;
  url: string;
  ip?: string;
  geo?: string;
  status: string;
  hash: string;
  tempoCarregamentoMs?: number;
  titulo?: string;
  description?: string;
  headers?: Record<string, string>;
  techStack?: string[];
  seo?: {
    h1Count: number;
    hasAltTags: boolean;
    hasMetaDescription: boolean;
    hasTitleTag: boolean;
  };
  screenshotUrl?: string;
  html?: string;
}

export async function gerarRelatorioPDF(data: RelatorioData) {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;
  pdfMake.vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;

  const resultadoSeo = data.html ? analisarSeo(data.html) : null;
  const resultadoSeguranca = data.headers
    ? avaliarSeguranca(data.headers)
    : null;

  let screenshotImage = null;

  if (data.screenshotUrl) {
    try {
      const res = await fetch(data.screenshotUrl);
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      screenshotImage = {
        image: base64,
        width: 400,
        margin: [0, 10, 0, 10],
      };
    } catch (e) {
      console.warn("Erro ao carregar imagem:", e);
    }
  }

  function getStatusCor(status: string) {
    switch (status) {
      case "ok":
        return { text: "✔️ Online", color: "green" };
      case "erro":
        return { text: "❌ Erro", color: "red" };
      case "alterado":
        return { text: "⚠️ Alterado", color: "orange" };
      default:
        return { text: status, color: "gray" };
    }
  }

  const statusObj = getStatusCor(data.status);

  const docDefinition: any = {
    content: [
      { text: "Relatório de Análise de Site", style: "header" },

      { text: `Site: ${data.nome}`, style: "subheader" },
      { text: `URL: ${data.url}` },
      { text: `IP: ${data.ip ?? "-"}` },
      { text: `Localização: ${data.geo ?? "-"}` },
      { text: `Tempo de Carregamento: ${data.tempoCarregamentoMs ?? "-"}ms` },
      { text: `Hash do HTML: ${data.hash}` },
      {
        text: `Status: ${statusObj.text}`,
        color: statusObj.color,
        margin: [0, 5, 0, 5],
      },
      "\n",

      { text: "Pontuação de Segurança", style: "section" },
      resultadoSeguranca
        ? {
            ul: resultadoSeguranca.recomendacoes.map((r: string) => `• ${r}`),
          }
        : { text: "Não disponível." },
      "\n",

      { text: "SEO", style: "section" },
      resultadoSeo
        ? {
            ul: [
              `Tag <title>: ${resultadoSeo.hasTitleTag ? "✔️" : "❌"}`,
              `Meta description: ${
                resultadoSeo.hasMetaDescription ? "✔️" : "❌"
              }`,
              `Imagens com alt: ${resultadoSeo.hasAltTags ? "✔️" : "❌"}`,
              `Quantidade de H1: ${resultadoSeo.h1Count}`,
            ],
          }
        : { text: "Não disponível." },
      "\n",

      { text: "Tecnologias Detectadas", style: "section" },
      { text: data.techStack?.join(", ") || "Nenhuma tecnologia detectada." },
      "\n",

      { text: "Headers HTTP", style: "section" },
      data.headers
        ? {
            ul: Object.entries(data.headers).map(([k, v]) => `${k}: ${v}`),
          }
        : { text: "Não disponível." },

      "\n",
      { text: `Descrição da página:`, bold: true },
      { text: data.description || "-" },
      "\n",

      screenshotImage ? { text: "Screenshot do site", style: "section" } : {},
      screenshotImage || {},

      "\n\n",
      {
        text: "Gerado por: SeuSistema.com",
        alignment: "right",
        italics: true,
        fontSize: 10,
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      section: {
        fontSize: 12,
        bold: true,
        margin: [0, 10, 0, 3],
      },
    },
  };

  pdfMake.createPdf(docDefinition).download(`relatorio-${data.nome}.pdf`);
}
