// src/pages/api/site.ts
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method === "GET") {
    const sites = await prisma.site.findMany({
      orderBy: { criadoEm: "desc" },
    });
    return res.status(200).json(sites);
  }

  if (method === "POST") {
    const { nome, url } = req.body;
    if (!nome || !url) {
      return res.status(400).json({ error: "Nome e URL são obrigatórios." });
    }

    const novoSite = await prisma.site.create({
      data: { nome, url },
    });

    return res.status(201).json(novoSite);
  }

  if (method === "PUT") {
    const { id, nome, url } = req.body;
    if (!id || !nome || !url) {
      return res
        .status(400)
        .json({ error: "ID, Nome e URL são obrigatórios." });
    }

    const siteAtualizado = await prisma.site.update({
      where: { id },
      data: { nome, url },
    });

    return res.status(200).json(siteAtualizado);
  }

  if (method === "DELETE") {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({ error: "ID é obrigatório para exclusão." });
    }

    await prisma.verificacao.deleteMany({ where: { siteId: id } });
    await prisma.site.delete({ where: { id } });

    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
