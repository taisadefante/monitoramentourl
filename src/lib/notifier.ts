// src/lib/monitorUtils.ts
import { chromium } from "playwright";
import CryptoJS from "crypto-js";
import fs from "fs";
import path from "path";

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
    const hash = CryptoJS.SHA256(html).toString();
    const status = response?.status() ?? 0;
    const titulo = await page.title();

    const headers = response?.headers() || {};
    const imagens = await page.$$eval("img", (imgs) =>
      imgs.map((img) => ({
        src: img.getAttribute("src") || "",
        alt: img.getAttribute("alt") || "",
      }))
    );

    const fileName = `${Date.now()}-${encodeURIComponent(url).replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}.png`;
    const screenshotPath = path.resolve("public/img", fileName);
    await page.screenshot({ path: screenshotPath });

    await browser.close();

    return {
      status: "ok",
      codigo: status,
      mensagem: "Site acessado com sucesso",
      hash,
      temHttps: url.startsWith("https://"),
      tempoCarregamentoMs: duracao,
      screenshot: `/img/${fileName}`,
      titulo,
      headers,
      imagens,
      html,
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
