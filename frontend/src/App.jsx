import React, { useEffect, useMemo, useState } from "react";

/**
 * Ajuste aqui a porta do seu backend
 * Ex: 8081 (como nos seus prints)
 */
const API_BASE = "http://localhost:8081";
const API_URL = import.meta.env.VITE_API_URL;
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);


function calcularIdade(dataISO) {
  if (!dataISO) return "";
  const hoje = new Date();
  const nasc = new Date(dataISO);

  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;

  return idade;
}

const etapaItems = [
  { id: "inicial", label: "Formulário Inicial" },
  { id: "gravacao", label: "Gravação / Nascimento" },
  { id: "diagExterno", label: "Diagnóstico Externo" },
  { id: "tipoMotivo", label: "Tipo / Motivo" },
  { id: "diagInterno", label: "Diagnóstico Interno" },
  { id: "proposta", label: "Proposta / Solução" },
  { id: "etapaFinal", label: "Etapa Final" },
  { id: "salvos", label: "Atendimentos Salvos" },
];

const SELECT_SIM_NAO = ["Selecione", "Sim", "Não"];
const SELECT_TIPO_SOLICITACAO = ["Selecione", "Trancamento", "Cancelamento", "Tratativa"];
const SELECT_MOTIVO = ["Selecione", "Acadêmico", "Financeiro", "Pessoal", "Saúde", "Mudança de cidade", "Outros"];
const SELECT_NOTAS = ["Selecione", "Boas", "Médias", "Ruins"];
const SELECT_QTD_TRANC = ["Selecione", "0", "1", "2", "3", "4"];
const SELECT_RESPONSAVEL = ["Selecione", "Sim", "Não", "N/A"];

const PRAZOS_TRANCAMENTO = [
  "ATÉ 31/10/2025 - Prazo final para solicitação de trancamento de matrícula para o 2º semestre de 2025",
  "ATÉ 06/03/2026 - Final do período para solicitação de reabertura de matrícula (todos os cursos)",
  "A PARTIR DE 18/05 - Início do período para solicitação de reabertura de matrícula (todos os cursos), referente ao 2º semestre de 2026",
];

const initialForm = {
  // Formulário Inicial
  tipoCurso: "",
  nomeCompletoAluno: "",
  numeroMatricula: "",
  curso: "",
  periodo: "",

  // Gravação / nascimento
  atendimentoGravado: null,
  dataNascimento: "",
  idade: "",
  menorDeIdade: "",
  responsavelProximo: "Selecione",

  // Diagnóstico externo
  diagnosticoExterno: "",

  // Tipo / motivo
  tipoSolicitacao: "Selecione",
  motivoSolicitacao: "Selecione",

  // Diagnóstico interno
  qtdTrancamentos: "Selecione",
  notas: "Selecione",
  bolsaOuFinanciamento: "Selecione",
  podeTrancarSemPerderBeneficio: "Selecione",

  // Proposta / solução
  propostaSolucao: "",
  outraArgumentacao: "",
  decisaoSobreArgumentacoes: "",

  // Etapa Final
  decisaoEstudanteOuResponsavel: "Selecione",
  retornoProximoSemestre: "Selecione",
  retorno3meses: false,
  retorno6meses: false,
  retorno9meses: false,

  prazoTrancamentoSelecionado: "",

  informarPrazo2DiasUteis: false,
  solicitarDadosBancarios: false,
  atendimentoFinalizado: false,
};

function Label({ children }) {
  return <label className="text-sm font-semibold text-slate-700">{children}</label>;
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 " +
        className
      }
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 " +
        className
      }
    >
      {children}
    </select>
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 " +
        className
      }
    />
  );
}

function Card({ title, subtitle, children, right }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {right ? <div className="pt-1">{right}</div> : null}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = {
    primary:
      "bg-[#7a0026] text-white hover:brightness-110 focus:ring-4 focus:ring-[#7a0026]/15",
    subtle: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-4 focus:ring-slate-200",
    danger: "bg-rose-600 text-white hover:brightness-110 focus:ring-4 focus:ring-rose-200",
    outline:
      "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus:ring-4 focus:ring-slate-100",
  };
  return <button {...props} className={`${base} ${styles[variant]} ${className}`} />;
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300"
      />
      <span className="text-slate-700">{label}</span>
    </label>
  );
}

export default function App() {
  const [activeStep, setActiveStep] = useState("inicial");
  const [form, setForm] = useState(initialForm);
  const [atendimentos, setAtendimentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState("");

  async function carregarAtendimentos() {
    try {
      setLoading(true);
      const r = await fetch(API_URL);
      if (!r.ok) throw new Error(`Erro ao listar: ${r.status}`);
      const data = await r.json();
      setAtendimentos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setToast("Não foi possível carregar atendimentos (veja o console).");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAtendimentos();
  }, []);

  const menorMsg = useMemo(() => {
    if (!form.menorDeIdade) return "—";
    return form.menorDeIdade === "Sim"
      ? "Menor de idade: solicitar responsável no atendimento."
      : "Maior de idade.";
  }, [form.menorDeIdade]);

  function onNascimentoChange(data) {
    const idadeCalc = calcularIdade(data);
    setForm((prev) => ({
      ...prev,
      dataNascimento: data,
      idade: idadeCalc === "" ? "" : idadeCalc,
      menorDeIdade: idadeCalc === "" ? "" : (idadeCalc < 18 ? "Sim" : "Não"),
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function scrollTo(stepId) {
    setActiveStep(stepId);
    const el = document.getElementById(stepId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function salvar() {
    try {
      setLoading(true);

      const payload = {
        ...form,
        // Tipos coerentes com o backend:
        qtdTrancamentos: form.qtdTrancamentos === "Selecione" ? null : Number(form.qtdTrancamentos),
        idade: form.idade === "" ? null : Number(form.idade),
        menorDeIdade: form.menorDeIdade === "" ? null : form.menorDeIdade === "Sim",
        dataNascimento: form.dataNascimento || null,
        // Se estiver null, o back pode aceitar
        atendimentoGravado: form.atendimentoGravado,
      };

      const isEdit = !!editingId;
      const url = isEdit ? `${API_URL}/${editingId}` : API_URL;
      const method = isEdit ? "PUT" : "POST";

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`Erro ao salvar (${r.status}): ${t}`);
      }

      setToast(isEdit ? "Atendimento atualizado com sucesso." : "Atendimento salvo com sucesso.");
      resetForm();
      await carregarAtendimentos();
      scrollTo("salvos");
    } catch (e) {
      console.error(e);
      setToast("Erro ao salvar (veja o console).");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(""), 2500);
    }
  }

  function preencherParaEdicao(a) {
    setEditingId(a.id);
    setForm({
      ...initialForm,

      tipoCurso: a.tipoCurso ?? "",
      nomeCompletoAluno: a.nomeCompletoAluno ?? "",
      numeroMatricula: a.numeroMatricula ?? "",
      curso: a.curso ?? "",
      periodo: a.periodo ?? "",

      atendimentoGravado: a.atendimentoGravado ?? null,
      dataNascimento: a.dataNascimento ?? "",
      idade: a.idade ?? "",
      menorDeIdade: a.menorDeIdade == null ? "" : a.menorDeIdade ? "Sim" : "Não",
      responsavelProximo: a.responsavelProximo ?? "Selecione",

      diagnosticoExterno: a.diagnosticoExterno ?? "",

      tipoSolicitacao: a.tipoSolicitacao ?? "Selecione",
      motivoSolicitacao: a.motivoSolicitacao ?? "Selecione",

      qtdTrancamentos: a.qtdTrancamentos == null ? "Selecione" : String(a.qtdTrancamentos),
      notas: a.notas ?? "Selecione",
      bolsaOuFinanciamento: a.bolsaOuFinanciamento ?? "Selecione",
      podeTrancarSemPerderBeneficio: a.podeTrancarSemPerderBeneficio ?? "Selecione",

      propostaSolucao: a.propostaSolucao ?? "",
      outraArgumentacao: a.outraArgumentacao ?? "",
      decisaoSobreArgumentacoes: a.decisaoSobreArgumentacoes ?? "",

      decisaoEstudanteOuResponsavel: a.decisaoEstudanteOuResponsavel ?? "Selecione",
      retornoProximoSemestre: a.retornoProximoSemestre ?? "Selecione",
      retorno3meses: !!a.retorno3meses,
      retorno6meses: !!a.retorno6meses,
      retorno9meses: !!a.retorno9meses,

      prazoTrancamentoSelecionado: a.prazoTrancamentoSelecionado ?? "",

      informarPrazo2DiasUteis: !!a.informarPrazo2DiasUteis,
      solicitarDadosBancarios: !!a.solicitarDadosBancarios,
      atendimentoFinalizado: !!a.atendimentoFinalizado,
    });

    scrollTo("inicial");
  }

  async function excluir(id) {
    if (!confirm("Tem certeza que deseja excluir este atendimento?")) return;
    try {
      setLoading(true);
      const r = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`Erro ao excluir: ${r.status}`);
      setToast("Atendimento excluído.");
      await carregarAtendimentos();
    } catch (e) {
      console.error(e);
      setToast("Erro ao excluir (veja o console).");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(""), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* TOPBAR */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-300 items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo placeholder (trocar por /public/logo-pucpr.svg depois) */}
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7a0026] text-white shadow-sm">
              <span className="text-sm font-black">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight">Sistema de Retenção de Alunos</h1>
                <Pill>Modelo institucional</Pill>
              </div>
              <p className="text-xs text-slate-600">
                Plataforma interna para acompanhamento de trancamento/cancelamento.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-slate-800">Usuário</p>
              <p className="text-xs text-slate-500">Operador(a) • </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200" title="Avatar (placeholder)" />
          </div>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="mx-auto grid max-w-300 grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[280px_1fr]">
        {/* SIDEBAR */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-19.5 lg:h-[calc(100vh-100px)] lg:overflow-auto">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Etapas</p>
            <p className="mt-1 text-sm text-slate-700">Navegue por seções.</p>
          </div>

          <nav className="space-y-1">
            {etapaItems.map((it) => (
              <button
                key={it.id}
                onClick={() => scrollTo(it.id)}
                className={[
                  "w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition",
                  activeStep === it.id
                    ? "bg-[#7a0026]/10 text-[#7a0026]"
                    : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                {it.label}
              </button>
            ))}
          </nav>

          <div className="mt-5 rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-700">Status</p>
            <p className="mt-1 text-xs text-slate-600">
              {editingId ? `Editando atendimento #${editingId}` : "Novo atendimento"}
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={resetForm} disabled={loading}>
                Limpar
              </Button>
              <Button className="flex-1" onClick={salvar} disabled={loading}>
                {editingId ? "Atualizar" : "Gravar e Enviar"}
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-bold text-slate-700">Aviso</p>
            <p className="mt-1 text-xs text-slate-600">{menorMsg}</p>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="space-y-5">
          {toast ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm">
              {toast}
            </div>
          ) : null}

          {/* Formulário Inicial */}
          <section id="inicial">
            <Card title="Formulário Inicial" subtitle="Campos principais do aluno e do curso.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Tipo do curso *</Label>
                  <Input
                    placeholder="Ex: Graduação / Pós..."
                    value={form.tipoCurso}
                    onChange={(e) => setForm((p) => ({ ...p, tipoCurso: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Número de matrícula *</Label>
                  <Input
                    placeholder="Ex: 40107530"
                    value={form.numeroMatricula}
                    onChange={(e) => setForm((p) => ({ ...p, numeroMatricula: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Nome completo do aluno *</Label>
                  <Input
                    placeholder="Nome completo"
                    value={form.nomeCompletoAluno}
                    onChange={(e) => setForm((p) => ({ ...p, nomeCompletoAluno: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Curso *</Label>
                  <Input
                    placeholder="Ex: Psicologia"
                    value={form.curso}
                    onChange={(e) => setForm((p) => ({ ...p, curso: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Período</Label>
                  <Input
                    placeholder="Ex: 2°"
                    value={form.periodo}
                    onChange={(e) => setForm((p) => ({ ...p, periodo: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Gravação da conversa</Label>
                  <Select
                    value={
                      form.atendimentoGravado === true
                        ? "Sim"
                        : form.atendimentoGravado === false
                        ? "Não"
                        : "Selecione"
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((p) => ({
                        ...p,
                        atendimentoGravado: v === "Sim" ? true : v === "Não" ? false : null,
                      }));
                    }}
                  >
                    <option value="Selecione">Selecione</option>
                    <option value="Sim">Avise que o atendimento está sendo gravado</option>
                    <option value="Não">Não gravado "Chat / WhatsApp"</option>
                  </Select>
                </div>
              </div>
            </Card>
          </section>

          {/* Nascimento / Menor */}
          <section id="gravacao">
            <Card
              title="Data de nascimento / Menor de idade"
              subtitle="Ao selecionar a data, a idade e o status de menor são calculados automaticamente."
              right={<Pill>{menorMsg}</Pill>}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Data de nascimento do estudante</Label>
                  <Input
                    type="date"
                    value={form.dataNascimento || ""}
                    onChange={(e) => onNascimentoChange(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Idade (automático)</Label>
                  <Input value={form.idade ?? ""} readOnly className="bg-slate-50" />
                </div>

                <div>
                  <Label>Menor de idade? (automático)</Label>
                  <Input value={form.menorDeIdade ?? ""} readOnly className="bg-slate-50" />
                </div>

                <div>
                  <Label>Responsável legal está próximo?</Label>
                  <Select
                    value={form.responsavelProximo}
                    onChange={(e) => setForm((p) => ({ ...p, responsavelProximo: e.target.value }))}
                  >
                    {SELECT_RESPONSAVEL.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>
          </section>

          {/* Diagnóstico Externo */}
          <section id="diagExterno">
            <Card
              title="Diagnóstico Externo"
              subtitle="Entender o cenário do estudante, deixar ele falar sobre o motivo e o contexto."
            >
              <Label>Observações (texto livre)</Label>
              <Textarea
                rows={6}
                placeholder="Deixe o aluno falar: motivo, como conduziu, o que já foi feito..."
                value={form.diagnosticoExterno}
                onChange={(e) => setForm((p) => ({ ...p, diagnosticoExterno: e.target.value }))}
              />
            </Card>
          </section>

          {/* Tipo / Motivo */}
          <section id="tipoMotivo">
            <Card title="Tipo / Motivo" subtitle="Classificação da demanda.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Tipo da Solicitação</Label>
                  <Select
                    value={form.tipoSolicitacao}
                    onChange={(e) => setForm((p) => ({ ...p, tipoSolicitacao: e.target.value }))}
                  >
                    {SELECT_TIPO_SOLICITACAO.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Motivo da Solicitação</Label>
                  <Select
                    value={form.motivoSolicitacao}
                    onChange={(e) => setForm((p) => ({ ...p, motivoSolicitacao: e.target.value }))}
                  >
                    {SELECT_MOTIVO.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>
          </section>

          {/* Diagnóstico Interno */}
          <section id="diagInterno">
            <Card
              title="Diagnóstico Interno"
              subtitle="Perfil acadêmico/financeiro para apoiar a proposta/solução."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Quantos trancamentos possuí?</Label>
                  <Select
                    value={form.qtdTrancamentos}
                    onChange={(e) => setForm((p) => ({ ...p, qtdTrancamentos: e.target.value }))}
                  >
                    {SELECT_QTD_TRANC.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                  <p className="mt-1 text-xs text-slate-500">
                    Durante o curso: até 4 semestres (2 anos), ininterruptos ou não.
                  </p>
                </div>

                <div>
                  <Label>Como estão as notas?</Label>
                  <Select value={form.notas} onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}>
                    {SELECT_NOTAS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                  <p className="mt-1 text-xs text-slate-500">
                    Dica: Boas notas é um bom argumento para o aluno continuar.
                  </p>
                </div>

                <div>
                  <Label>Tem bolsa ou financiamento?</Label>
                  <Select
                    value={form.bolsaOuFinanciamento}
                    onChange={(e) => setForm((p) => ({ ...p, bolsaOuFinanciamento: e.target.value }))}
                  >
                    {SELECT_SIM_NAO.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Pode trancar sem perder o benefício?</Label>
                  <Select
                    value={form.podeTrancarSemPerderBeneficio}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, podeTrancarSemPerderBeneficio: e.target.value }))
                    }
                  >
                    {SELECT_SIM_NAO.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>
          </section>

          {/* Proposta / Solução */}
          <section id="proposta">
            <Card title="Proposta / Solução" subtitle="Com base no diagnóstico, registrar a proposta e a decisão.">
              <div className="space-y-4">
                <div>
                  <Label>Proposta / Solução</Label>
                  <Textarea
                    rows={4}
                    placeholder="Descreva a proposta apresentada ao estudante..."
                    value={form.propostaSolucao}
                    onChange={(e) => setForm((p) => ({ ...p, propostaSolucao: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Outra argumentação</Label>
                  <Textarea
                    rows={3}
                    placeholder="Ex: finalizar o ano para realizar mudança de curso no próximo semestre..."
                    value={form.outraArgumentacao}
                    onChange={(e) => setForm((p) => ({ ...p, outraArgumentacao: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Decisão do aluno sobre as argumentações</Label>
                  <Textarea
                    rows={3}
                    placeholder="Digite aqui..."
                    value={form.decisaoSobreArgumentacoes}
                    onChange={(e) => setForm((p) => ({ ...p, decisaoSobreArgumentacoes: e.target.value }))}
                  />
                </div>
              </div>
            </Card>
          </section>

          {/* Etapa Final */}
          <section id="etapaFinal">
            <Card title="Etapa Final" subtitle="Checklist final e previsões de retorno.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>Decisão do estudante/responsável</Label>
                  <Select
                    value={form.decisaoEstudanteOuResponsavel}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, decisaoEstudanteOuResponsavel: e.target.value }))
                    }
                  >
                    {SELECT_TIPO_SOLICITACAO.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Podemos contar com retorno no próximo semestre?</Label>
                  <Select
                    value={form.retornoProximoSemestre}
                    onChange={(e) => setForm((p) => ({ ...p, retornoProximoSemestre: e.target.value }))}
                  >
                    {SELECT_SIM_NAO.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label>Quando posso te retornar para saber como você está?</Label>
                  <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Check
                      label="3 meses"
                      checked={form.retorno3meses}
                      onChange={(v) => setForm((p) => ({ ...p, retorno3meses: v }))}
                    />
                    <Check
                      label="6 meses"
                      checked={form.retorno6meses}
                      onChange={(v) => setForm((p) => ({ ...p, retorno6meses: v }))}
                    />
                    <Check
                      label="9 meses"
                      checked={form.retorno9meses}
                      onChange={(v) => setForm((p) => ({ ...p, retorno9meses: v }))}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label>Prazos de solicitação de trancamento</Label>
                  <div className="mt-2 space-y-2">
                    {PRAZOS_TRANCAMENTO.map((txt) => (
                      <label
                        key={txt}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="prazoTrancamentoSelecionado"
                          checked={form.prazoTrancamentoSelecionado === txt}
                          onChange={() => setForm((p) => ({ ...p, prazoTrancamentoSelecionado: txt }))}
                          className="mt-1 h-4 w-4"
                        />
                        <span className="text-slate-700">{txt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label>Etapa Final (Geral)</Label>
                  <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Check
                      label="Prazo de até 2 dias úteis para tratamento do protocolo"
                      checked={form.informarPrazo2DiasUteis}
                      onChange={(v) => setForm((p) => ({ ...p, informarPrazo2DiasUteis: v }))}
                    />
                    <Check
                      label="Solicitar dados bancários do aluno para inclusão no protocolo"
                      checked={form.solicitarDadosBancarios}
                      onChange={(v) => setForm((p) => ({ ...p, solicitarDadosBancarios: v }))}
                    />
                    <Check
                      label="Atendimento Finalizado"
                      checked={form.atendimentoFinalizado}
                      onChange={(v) => setForm((p) => ({ ...p, atendimentoFinalizado: v }))}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  Dica: se “Gravar e Enviar” não fizer nada, abra o Console (F12) e veja se há erro de API/CORS.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetForm} disabled={loading}>
                    Limpar
                  </Button>
                  <Button onClick={salvar} disabled={loading}>
                    {editingId ? "Atualizar" : "Gravar e Enviar"}
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {/* TABELA SALVOS */}
          <section id="salvos">
            <Card
              title="Atendimentos Salvos"
              subtitle="Edite ou exclua registros. Clique em “Atualizar” para recarregar."
              right={
                <Button variant="subtle" onClick={carregarAtendimentos} disabled={loading}>
                  Atualizar
                </Button>
              }
            >
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full bg-white">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">Matrícula</th>
                      <th className="px-4 py-3">Curso</th>
                      <th className="px-4 py-3">Nascimento</th>
                      <th className="px-4 py-3">Idade</th>
                      <th className="px-4 py-3">Menor?</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Motivo</th>
                      <th className="px-4 py-3">Criado em</th>
                      <th className="px-4 py-3">Ações</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {atendimentos.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-sm text-slate-600" colSpan={11}>
                          Nenhum atendimento salvo ainda.
                        </td>
                      </tr>
                    ) : (
                      atendimentos.map((a) => (
                        <tr key={a.id} className="text-sm text-slate-800">
                          <td className="px-4 py-3 font-semibold">{a.id}</td>
                          <td className="px-4 py-3">{a.nomeCompletoAluno ?? "-"}</td>
                          <td className="px-4 py-3">{a.numeroMatricula ?? "-"}</td>
                          <td className="px-4 py-3">{a.curso ?? "-"}</td>
                          <td className="px-4 py-3">{a.dataNascimento ?? "-"}</td>
                          <td className="px-4 py-3">{a.idade ?? "-"}</td>
                          <td className="px-4 py-3">
                            {a.menorDeIdade == null ? "-" : a.menorDeIdade ? "Sim" : "Não"}
                          </td>
                          <td className="px-4 py-3">{a.tipoSolicitacao ?? "-"}</td>
                          <td className="px-4 py-3">{a.motivoSolicitacao ?? "-"}</td>
                          <td className="px-4 py-3">{a.criadoEm ?? "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => preencherParaEdicao(a)}>
                                Editar
                              </Button>
                              <Button variant="danger" onClick={() => excluir(a.id)}>
                                Excluir
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
            
                </div>
                {editingId ? (
                  <div className="flex items-center gap-2">
                    <Pill>Editando #{editingId}</Pill>
                    <Button variant="outline" onClick={resetForm}>
                      Cancelar edição
                    </Button>
                  </div>
                ) : null}
              </div>
            </Card>
          </section>

          {/* Footer institucional */}
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-xs text-slate-600">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>
                © {new Date().getFullYear()} • Sistema de Retenção de Alunos (modelo piloto)
              </span>
              <span className="text-slate-500">
                 LOGO PUC
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
