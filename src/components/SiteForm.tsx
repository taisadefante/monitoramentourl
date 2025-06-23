import React, { useState } from "react";
import axios from "axios";

export default function SiteForm({ onSuccess }: { onSuccess: () => void }) {
  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação simples de URL
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      alert("A URL deve começar com http:// ou https://");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/site", { nome, url });
      setNome("");
      setUrl("");
      setSucesso(true);
      onSuccess();
      setTimeout(() => setSucesso(false), 3000); // Oculta depois de 3s
    } catch (error) {
      console.error("Erro ao adicionar site:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      {sucesso && (
        <div className="alert alert-success" role="alert">
          ✅ Site adicionado com sucesso!
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="nome" className="form-label">
          Nome do site
        </label>
        <input
          id="nome"
          type="text"
          placeholder="Ex: Portal Defan"
          className="form-control"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="url" className="form-label">
          URL do site
        </label>
        <input
          id="url"
          type="url"
          placeholder="https://www.seusite.com"
          className="form-control"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? "Adicionando..." : "➕ Adicionar Site"}
      </button>
    </form>
  );
}
