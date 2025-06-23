// src/pages/alertas.tsx

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimesCircle,
} from "react-icons/fa";

type Alerta = {
  site: string;
  tipo: "erro" | "alterado" | "info";
  mensagem: string;
  criadoEm: {
    seconds: number;
  };
};

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const carregarAlertas = async () => {
    const q = query(collection(db, "alertas"), orderBy("criadoEm", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => doc.data() as Alerta);
    setAlertas(data);
  };

  useEffect(() => {
    carregarAlertas();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📢 Alertas de Monitoramento</h2>

      {alertas.length === 0 ? (
        <p className="text-muted">Nenhum alerta registrado.</p>
      ) : (
        alertas.map((alerta, index) => (
          <div
            key={index}
            className={`alert alert-${mapaTipo(
              alerta.tipo
            )} d-flex align-items-start gap-3`}
          >
            <div className="fs-4">{iconeTipo(alerta.tipo)}</div>
            <div>
              <strong>{alerta.site}</strong> — {alerta.mensagem}
              <div>
                <small className="text-muted">
                  {new Date(alerta.criadoEm.seconds * 1000).toLocaleString()}
                </small>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function mapaTipo(tipo: string) {
  switch (tipo) {
    case "erro":
      return "danger"; // Bootstrap vermelho
    case "alterado":
      return "warning"; // Amarelo
    default:
      return "info"; // Azul claro
  }
}

function iconeTipo(tipo: string) {
  switch (tipo) {
    case "erro":
      return <FaTimesCircle className="text-danger" />;
    case "alterado":
      return <FaExclamationTriangle className="text-warning" />;
    default:
      return <FaInfoCircle className="text-info" />;
  }
}
