import { useEffect, useState } from "react";
import axios from "axios";
import SiteCard from "@/components/SiteCard";
import SiteForm from "@/components/SiteForm";
import "bootstrap/dist/css/bootstrap.min.css";

type Site = {
  id: string;
  nome: string;
  url: string;
  status?: string;
  ultimoCheck?: string;
};

export default function Home() {
  const [sites, setSites] = useState<Site[]>([]);

  const carregarSites = async () => {
    const res = await axios.get("/api/site");
    setSites(res.data);
  };

  useEffect(() => {
    carregarSites();
  }, []);

  return (
    <main className="container py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">🔐 Monitoramento de Segurança de Sites</h1>
        <p className="text-muted">
          Verifique a integridade e disponibilidade dos seus domínios.
        </p>
      </div>

      <div className="card shadow-sm p-4 mb-5">
        <h5 className="mb-3">➕ Adicionar Novo Site</h5>
        <SiteForm onSuccess={carregarSites} />
      </div>

      <div className="row">
        {sites.length === 0 ? (
          <p className="text-muted">Nenhum site cadastrado ainda.</p>
        ) : (
          sites.map((site) => (
            <div className="col-md-6 col-lg-4 mb-4" key={site.id}>
              <SiteCard {...site} onAtualizar={carregarSites} />
            </div>
          ))
        )}
      </div>
    </main>
  );
}
