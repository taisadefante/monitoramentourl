// monitorUtils.ts corrigido com detectarMalwareDetalhado()
import { chromium } from "playwright";
import CryptoJS from "crypto-js";
import fs from "fs";
import path from "path";
import dns from "dns/promises";
import { detectarMalwareDetalhado } from "@/utils/detectarMalware"; // ✅ novo

export async function verificarSite(url: string) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36",
    });
    const page = await context.newPage();

    const inicio = Date.now();
    const response = await page.goto(url, {
      timeout: 15000,
      waitUntil: "networkidle",
    });
    const duracao = Date.now() - inicio;

    const html = await page.content();
    const titulo = await page.title();
    const hash = CryptoJS.SHA256(html).toString();
    const status = response?.status() ?? 0;
    const headers = response?.headers() ?? {};
    const host = new URL(url).hostname;

    let ip = null;
    try {
      const res = await dns.lookup(host);
      ip = res?.address;
    } catch (e) {
      ip = "Desconhecido";
    }

    const geoLocation = await getGeoFromIP(ip);
    const techStack = await detectarTecnologias(html);
    const imagens = await page.$$eval("img", (imgs) =>
      imgs.map((img) => ({ src: img.src, alt: img.alt }))
    );

    const fileName = `${Date.now()}-${encodeURIComponent(url).replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}.png`;
    const screenshotPath = path.resolve("public/img/historico", fileName);
    await fs.promises.mkdir(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath });

    await browser.close();

    const seo = analisarSeo(html);
    const seguranca = avaliarSeguranca(headers);
    const metadados = calcularMetadados(html);
    const malware = detectarMalwareDetalhado(html); // ✅ atualizado

    return {
      status: "ok",
      codigo: status,
      mensagem: "Site acessado com sucesso",
      titulo,
      hash,
      temHttps: url.startsWith("https://"),
      tempoCarregamentoMs: duracao,
      screenshot: `/img/historico/${fileName}`,
      headers,
      html,
      imagens,
      ip,
      host,
      geoLocation,
      techStack,
      description: extrairDescricao(html),
      seo,
      seguranca,
      ...metadados,
      malware, // ✅ detalhado
    };
  } catch (error: any) {
    if (browser) await browser.close();
    return {
      status: "erro",
      mensagem: error.message || "Erro desconhecido",
      codigo: 0,
    };
  }
}

async function getGeoFromIP(ip: string | null): Promise<string> {
  if (!ip || ip === "Desconhecido") return "Indisponível";
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const json = await res.json();
    return `${json.city || ""}, ${json.region || ""}, ${
      json.country_name || ""
    }`;
  } catch (e) {
    return "Não foi possível localizar";
  }
}

function detectarTecnologias(html: string): string[] {
  const techs: string[] = [];
  if (html.includes("wp-content") || html.includes("wp-includes"))
    techs.push("WordPress");
  if (html.includes("cdn.shopify.com")) techs.push("Shopify");
  if (html.includes("data-n-head")) techs.push("Nuxt.js");
  if (html.includes("__NEXT_DATA__")) techs.push("Next.js");
  if (html.includes("react")) techs.push("React");
  if (html.includes("vue")) techs.push("Vue.js");
  if (html.includes("firebase")) techs.push("Firebase");
  return techs;
}

function extrairDescricao(html: string): string {
  const match = html.match(
    /<meta name=["']description["'] content=["'](.*?)["']/i
  );
  return match?.[1] ?? "-";
}

function analisarSeo(html: string) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const h1Match = html.match(/<h1.*?>(.*?)<\/h1>/i);
  return {
    temTitle: !!titleMatch,
    temH1: !!h1Match,
  };
}

function avaliarSeguranca(headers: Record<string, any>) {
  return {
    temContentSecurityPolicy: !!headers["content-security-policy"],
    temStrictTransport: !!headers["strict-transport-security"],
  };
}

function calcularMetadados(html: string) {
  const charsetMatch = html.match(/<meta charset=["']?(.*?)["']?\s*\/>/i);
  const keywordsMatch = html.match(
    /<meta name=["']keywords["'] content=["'](.*?)["']/i
  );
  const viewportMatch = html.match(
    /<meta name=["']viewport["'] content=["'](.*?)["']/i
  );
  return {
    charset: charsetMatch?.[1] ?? "-",
    keywords: keywordsMatch?.[1] ?? "-",
    viewport: viewportMatch?.[1] ?? "-",
  };
}
