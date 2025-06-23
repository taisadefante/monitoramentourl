// SiteCard.tsx completo com destaque de malware e botão para baixar relatório
import React, { useState } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Spinner,
  Accordion,
  ListGroup,
  Image,
  Form,
} from "react-bootstrap";

interface SiteProps {
  id?: string;
  nome: string;
  url: string;
  status?: string;
  ultimoCheck?: string;
  onAtualizar?: () => void;
}

export default function SiteCard({
  id,
  nome,
  url,
  status,
  ultimoCheck,
  onAtualizar,
}: SiteProps) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resposta, setResposta] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [novoNome, setNovoNome] = useState(nome);
  const [novaUrl, setNovaUrl] = useState(url);

  const abrir = () => setShow(true);
  const fechar = () => {
    setResposta(null);
    setEditando(false);
    setShow(false);
  };

  const verificarAgora = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/monitor");
      const resultadoAtualizado = res.data?.resultados?.find(
        (s: any) => s.id === id || s.url === url
      );
      setResposta(resultadoAtualizado || { erro: "Sem dados retornados." });
      onAtualizar?.();
    } catch (err: any) {
      setResposta({ erro: err?.message || "Erro ao verificar site." });
    } finally {
      setLoading(false);
    }
  };

  const salvarEdicao = async () => {
    try {
      await axios.put("/api/site", { id, nome: novoNome, url: novaUrl });
      setEditando(false);
      onAtualizar?.();
    } catch (e) {
      alert("Erro ao salvar.");
    }
  };

  const excluirSite = async () => {
    if (confirm("Deseja realmente excluir?")) {
      await axios.delete(`/api/site?id=${id}`);
      fechar();
      onAtualizar?.();
    }
  };

  const baixarRelatorio = () => {
    if (!resposta) return;
    const conteudo = JSON.stringify(resposta, null, 2);
    const blob = new Blob([conteudo], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_${nome.replace(/\s+/g, "_")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const temMalware = resposta?.malware?.length > 0;

  return (
    <>
      <div
        className={`card h-100 shadow-sm border-0 cursor-pointer ${
          temMalware ? "border border-danger" : ""
        }`}
        onClick={abrir}
      >
        <div className="card-body">
          <h5 className="card-title">{nome}</h5>
          <p className="card-text mb-1">
            <strong>Status:</strong>{" "}
            <span className={`badge ${statusColor(status)}`}>
              {status ?? "pendente"}
            </span>
          </p>
          <p className="card-text">
            <small className="text-muted">
              Último check:{" "}
              {ultimoCheck ? new Date(ultimoCheck).toLocaleString() : "-"}
            </small>
          </p>
          {temMalware && (
            <p className="text-danger small mt-2">🚨 Ameaças detectadas</p>
          )}
        </div>
      </div>

      <Modal show={show} onHide={fechar} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🔍 Detalhes de {nome}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {editando ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>URL</Form.Label>
                <Form.Control
                  value={novaUrl}
                  onChange={(e) => setNovaUrl(e.target.value)}
                />
              </Form.Group>
            </Form>
          ) : (
            <p>
              <strong>URL:</strong>{" "}
              <a href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
            </p>
          )}

          {loading && (
            <div className="text-center my-3">
              <Spinner animation="border" />
              <p>Verificando site...</p>
            </div>
          )}

          {resposta && (
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>📄 Informações Gerais</Accordion.Header>
                <Accordion.Body>
                  {renderField(
                    "Status",
                    resposta.status,
                    "Situação atual do site."
                  )}
                  {renderField(
                    "Mensagem",
                    resposta.mensagem,
                    "Mensagem da verificação."
                  )}
                  {renderField(
                    "Título",
                    resposta.titulo,
                    "Título da aba do navegador."
                  )}
                  {renderField(
                    "Tempo de Carregamento",
                    `${resposta.tempoCarregamentoMs} ms`,
                    "Tempo de resposta do site."
                  )}
                  {renderField(
                    "HTTPS",
                    resposta.temHttps ? "Sim" : "Não",
                    "Conexão segura?"
                  )}
                  {renderField("Hash", resposta.hash, "Hash único do HTML.")}
                  {renderField("IP", resposta.ip, "Endereço IP do servidor.")}
                  {renderField("Host", resposta.host, "Domínio do site.")}
                  {renderField(
                    "Localização",
                    resposta.geoLocation,
                    "Localização aproximada."
                  )}
                  {renderField(
                    "Stack",
                    resposta.techStack?.join(", "),
                    "Tecnologias detectadas."
                  )}
                  {renderField(
                    "Descrição",
                    resposta.description,
                    "Meta description."
                  )}
                  {renderField(
                    "Charset",
                    resposta.charset,
                    "Codificação de caracteres."
                  )}
                  {renderField(
                    "Keywords",
                    resposta.keywords,
                    "Palavras-chave."
                  )}
                  {renderField(
                    "Viewport",
                    resposta.viewport,
                    "Responsividade."
                  )}
                  {renderField(
                    "SEO - Título",
                    resposta.seo?.temTitle ? "Sim" : "Não",
                    "Possui <title>?"
                  )}
                  {renderField(
                    "SEO - H1",
                    resposta.seo?.temH1 ? "Sim" : "Não",
                    "Possui <h1>?"
                  )}
                  {renderField(
                    "Segurança - Content Security Policy",
                    resposta.seguranca?.temContentSecurityPolicy
                      ? "Sim"
                      : "Não",
                    "Header de segurança CSP."
                  )}
                  {renderField(
                    "Segurança - Strict Transport",
                    resposta.seguranca?.temStrictTransport ? "Sim" : "Não",
                    "Header HTTPS obrigatório."
                  )}
                </Accordion.Body>
              </Accordion.Item>

              {resposta.headers && (
                <Accordion.Item eventKey="1">
                  <Accordion.Header>🧠 Headers HTTP</Accordion.Header>
                  <Accordion.Body>
                    <ListGroup>
                      {Object.entries(resposta.headers).map(([key, value]) => (
                        <ListGroup.Item key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Accordion.Body>
                </Accordion.Item>
              )}

              {resposta.imagens?.length > 0 && (
                <Accordion.Item eventKey="2">
                  <Accordion.Header>🖼️ Imagens encontradas</Accordion.Header>
                  <Accordion.Body>
                    <div className="d-flex flex-wrap gap-2">
                      {resposta.imagens.map((img: any, i: number) => (
                        <a
                          key={i}
                          href={img.src}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Image
                            src={img.src}
                            alt={img.alt || "Imagem"}
                            thumbnail
                            width={100}
                            height={100}
                          />
                        </a>
                      ))}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              )}

              {resposta.html && (
                <Accordion.Item eventKey="3">
                  <Accordion.Header>🧾 Código HTML</Accordion.Header>
                  <Accordion.Body>
                    <pre
                      className="small bg-light p-2 border rounded"
                      style={{ maxHeight: 300, overflowY: "auto" }}
                    >
                      {resposta.html}
                    </pre>
                  </Accordion.Body>
                </Accordion.Item>
              )}

              {resposta.screenshot && (
                <Accordion.Item eventKey="4">
                  <Accordion.Header>📸 Screenshot</Accordion.Header>
                  <Accordion.Body className="text-center">
                    <a
                      href={resposta.screenshot}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Image src={resposta.screenshot} fluid rounded />
                    </a>
                  </Accordion.Body>
                </Accordion.Item>
              )}

              {resposta?.malware?.length > 0 && (
                <Accordion.Item eventKey="5">
                  <Accordion.Header>
                    🚨 Possíveis Ameaças Detectadas
                  </Accordion.Header>
                  <Accordion.Body>
                    <ul className="text-danger">
                      {resposta.malware.map((item: any, i: number) => (
                        <li key={i} className="mb-3">
                          <strong className="text-danger">
                            ⚠️ {item.alerta}
                          </strong>
                          <pre className="bg-light p-2 border rounded small mt-1">
                            {item.trecho}
                          </pre>
                          <p className="mb-0">
                            <strong>📄 Arquivo:</strong> {item.arquivo || "-"}
                          </p>
                          <p className="mb-0">
                            <strong>🔢 Linha:</strong> {item.linha || "-"}
                          </p>
                          <p className="text-success">
                            <strong>✅ Correção:</strong> {item.sugestao}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted small">
                      ⚠️ Estes códigos podem estar fazendo o Google bloquear seu
                      site. Verifique scripts externos, plugins,
                      redirecionamentos e iframes.
                    </p>
                  </Accordion.Body>
                </Accordion.Item>
              )}
            </Accordion>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={baixarRelatorio}>
            📥 Baixar Relatório
          </Button>
          {editando ? (
            <>
              <Button variant="success" onClick={salvarEdicao}>
                Salvar
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button variant="warning" onClick={() => setEditando(true)}>
                Editar
              </Button>
              <Button variant="danger" onClick={excluirSite}>
                Excluir
              </Button>
              <Button
                variant="primary"
                onClick={verificarAgora}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : null}{" "}
                Verificar Agora
              </Button>
            </>
          )}
          <Button variant="outline-dark" onClick={fechar}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function renderField(label: string, value: any, descricao: string) {
  return (
    <p>
      <strong>{label}:</strong> {value || "-"}
      <br />
      <small>{descricao}</small>
    </p>
  );
}

function statusColor(status?: string) {
  switch (status) {
    case "ok":
      return "bg-success text-white";
    case "alterado":
      return "bg-warning text-dark";
    case "erro":
      return "bg-danger text-white";
    default:
      return "bg-secondary text-white";
  }
}
