// src/components/BadgePontuacao.tsx
export function BadgePontuacao({ pontuacao }: { pontuacao: number }) {
  return <span className="badge bg-info">Nota: {pontuacao}</span>;
}
