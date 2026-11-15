"use client";

import { useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import { Check, MessageCircle, X } from "lucide-react";
import { clsx } from "clsx";
import { brl, corHex, NOME_PAGAMENTO, resumo, whatsappLink, type DadosVitrine, type Item } from "@/lib/aparelho";
import { Contagem } from "./contagem";

export type FormPedido = { nome: string; whatsapp: string; pagamento: string; entrega: string; obs: string };
export type ResultadoPedido = { ok: true; numero: number; total: number; ate: string } | { ok: false; motivo: string };

const NOTA_PAGAMENTO: Record<string, string> = {
  pix: "O valor da vitrine, sem acréscimo",
  dinheiro: "O valor da vitrine, na retirada",
  cartao: "Com a taxa da máquina. O vendedor confirma o valor final",
  pix_cartao: "Você combina a entrada com o vendedor",
};
const ERROS: Record<string, string> = {
  dados: "Confira o nome e o WhatsApp com DDD.",
  ocupado: "Um dos aparelhos acabou de sair. Atualizei sua bandeja, confira e envie de novo.",
  limite: "Você já enviou vários pedidos agora há pouco. Fale com o vendedor para continuar.",
  link: "Este link de revenda não vale mais. Peça o link novo ao vendedor.",
};
const GUARDA = "cls-rv-comprador";

/** A barra que aparece assim que o revendedor pega o primeiro aparelho. */
export function Bandeja({ itens, barraRef, onAbrir }: { itens: Item[]; barraRef: React.RefObject<HTMLDivElement | null>; onAbrir: () => void }) {
  const total = itens.reduce((s, i) => s + i.preco, 0);
  const primeiro = itens.map((i) => i.ate).filter(Boolean).sort()[0] ?? null;
  return (
    <motion.div
      ref={barraRef}
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 90, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="mx-3 mb-[max(12px,env(safe-area-inset-bottom))] flex shrink-0 items-center gap-3 rounded-[22px] bg-white p-2 pl-4 text-noite shadow-[0_-10px_40px_-10px_rgb(0_0_0/0.8)]"
    >
      <div aria-hidden className="flex shrink-0 -space-x-2.5">
        {itens.slice(0, 4).map((i) => (
          <motion.span
            key={i.id}
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.3 }}
            className="h-7 w-7 rounded-full ring-2 ring-white"
            style={{ background: corHex(i.cor, i.nome), boxShadow: "inset 0 0 0 1px rgb(21 23 28 / 0.25)" }}
          />
        ))}
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate font-mono text-[16px] font-semibold tracking-[-0.02em]">{brl(total)}</p>
        <p className="truncate text-[12.5px] text-grafite">
          {itens.length === 1 ? "1 aparelho" : `${itens.length} aparelhos`} · <Contagem ate={primeiro} className="font-mono tabular-nums text-tinta" />
        </p>
      </div>
      <button type="button" onClick={onAbrir} className="h-12 shrink-0 rounded-2xl bg-ultramar px-4 text-[15px] font-semibold text-white transition hover:bg-ultramar-escuro">
        Fechar pedido
      </button>
    </motion.div>
  );
}

function Opcao({ nome, valor, atual, onChange, titulo, nota }: { nome: string; valor: string; atual: string; onChange: (v: string) => void; titulo: string; nota?: string }) {
  const id = useId();
  const ligado = atual === valor;
  return (
    <label
      htmlFor={id}
      className={clsx(
        "flex min-h-14 cursor-pointer flex-col justify-center rounded-2xl px-4 py-2.5 transition-shadow",
        ligado ? "bg-ultramar-claro shadow-[inset_0_0_0_2px_var(--color-ultramar)]" : "bg-branco shadow-[inset_0_0_0_1px_var(--color-linha)]",
      )}
    >
      <input id={id} type="radio" name={nome} value={valor} checked={ligado} onChange={() => onChange(valor)} className="sr-only" />
      <span className="text-[15.5px] font-semibold">{titulo}</span>
      {nota && <span className="text-[13px] text-grafite">{nota}</span>}
    </label>
  );
}

type Recibo = { numero: number; total: number; ate: string; itens: Item[]; form: FormPedido };

/** A folha de fechamento: confere a bandeja, escolhe como paga e como recebe, e envia. */
export function FecharPedido({
  itens,
  loja,
  onFechar,
  onSoltar,
  enviar,
}: {
  itens: Item[];
  loja: DadosVitrine["loja"];
  onFechar: () => void;
  onSoltar: (item: Item) => void;
  enviar: (f: FormPedido) => Promise<ResultadoPedido>;
}) {
  const [form, setForm] = useState<FormPedido>({ nome: "", whatsapp: "", pagamento: "pix", entrega: loja.retiradas[0] ?? "Entrega", obs: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [recibo, setRecibo] = useState<Recibo | null>(null);
  const total = itens.reduce((s, i) => s + i.preco, 0);
  const campo = (k: keyof FormPedido) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(GUARDA) ?? "null");
      if (salvo?.nome) setForm((f) => ({ ...f, nome: salvo.nome, whatsapp: salvo.whatsapp ?? "" }));
    } catch {
      // sem memória do navegador, o formulário só começa vazio
    }
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault();
    const digitos = form.whatsapp.replace(/\D/g, "");
    if (form.nome.trim().length < 2) return setErro("Diga seu nome ou o da loja.");
    if (digitos.length < 10 || digitos.length > 13) return setErro("Informe o WhatsApp com DDD.");
    setErro(null);
    setEnviando(true);
    const snapshot = itens;
    const r = await enviar(form);
    setEnviando(false);
    if (!r.ok) return setErro(ERROS[r.motivo] ?? "Não deu para enviar agora. Tente de novo em instantes.");
    try {
      localStorage.setItem(GUARDA, JSON.stringify({ nome: form.nome.trim(), whatsapp: form.whatsapp }));
    } catch {
      // segue sem lembrar
    }
    setRecibo({ numero: r.numero, total: r.total, ate: r.ate, itens: snapshot, form });
  }

  const entregaTexto = (v: string) => (v === "Entrega" ? "Entrega" : `Retirada em ${v}`);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end bg-black/65 backdrop-blur-sm lg:justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={recibo ? "Pedido enviado" : "Fechar pedido"}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className={clsx(
          "flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] lg:h-dvh lg:max-h-none lg:w-[500px] lg:rounded-none",
          recibo ? "bg-tinta text-white" : "bg-titanio text-tinta",
        )}
      >
        {recibo ? (
          <div className="overflow-y-auto px-5 pb-8 pt-10">
            <h2 className="font-display text-[42px] font-bold leading-[0.98] tracking-[-0.035em]">Pedido nº {recibo.numero} enviado.</h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-white/75">
              O vendedor da {loja.nome} já recebeu tudo pronto e confirma com você pelo WhatsApp.
            </p>

            <div className="relative mt-7 rounded-[22px] bg-vidro p-5 text-tinta">
              <motion.span
                aria-hidden
                initial={{ opacity: 0, scale: 1.7, rotate: -16 }}
                animate={{ opacity: 1, scale: 1, rotate: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.35 }}
                className="absolute right-4 top-4 rounded-lg border-2 border-ultramar px-2.5 py-1 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-ultramar"
              >
                Segurado
              </motion.span>
              <p className="max-w-[55%] text-[13.5px] leading-snug text-grafite">Seus aparelhos ficam separados por</p>
              <Contagem ate={recibo.ate} className="block font-mono text-[44px] font-semibold leading-none tracking-[-0.03em] tabular-nums" />

              <ul className="mt-4 border-t border-dashed border-nevoa">
                {recibo.itens.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 border-b border-dashed border-nevoa py-2.5">
                    <span aria-hidden className="h-[18px] w-[18px] shrink-0 rounded-full" style={{ background: corHex(i.cor, i.nome), boxShadow: "inset 0 0 0 1px rgb(21 23 28 / 0.25)" }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{i.nome}</span>
                      <span className="block truncate text-[13px] text-grafite">{resumo(i)}</span>
                    </span>
                    <span className="font-mono text-[14.5px] font-semibold">{brl(i.preco)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 grid grid-cols-[96px_1fr] gap-x-3 gap-y-1.5 text-[14.5px]">
                <dt className="text-grafite">Comprador</dt>
                <dd className="font-medium">{recibo.form.nome}</dd>
                <dt className="text-grafite">Pagamento</dt>
                <dd className="font-medium">{NOME_PAGAMENTO[recibo.form.pagamento]}</dd>
                <dt className="text-grafite">Recebe</dt>
                <dd className="font-medium">{entregaTexto(recibo.form.entrega)}</dd>
              </dl>
              <p className="mt-4 flex items-baseline justify-between">
                <span className="text-[14.5px] text-grafite">Total</span>
                <span className="font-mono text-[28px] font-semibold tracking-[-0.02em]">{brl(recibo.total)}</span>
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {loja.whatsapp && (
                <a
                  href={whatsappLink(
                    loja.whatsapp,
                    `Olá! Enviei o pedido nº ${recibo.numero} pela vitrine de revenda.\n` +
                      recibo.itens.map((i) => `• ${i.nome} · ${resumo(i)} — ${brl(i.preco)}`).join("\n") +
                      `\nTotal: ${brl(recibo.total)}\nPagamento: ${NOME_PAGAMENTO[recibo.form.pagamento]}\n${entregaTexto(recibo.form.entrega)}\n— ${recibo.form.nome}`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-ultramar text-[16px] font-semibold text-white"
                >
                  <MessageCircle size={18} aria-hidden /> Avisar no WhatsApp
                </a>
              )}
              <button type="button" onClick={onFechar} className="h-14 rounded-2xl border border-white/25 text-[15.5px] font-semibold text-white">
                Voltar à vitrine
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={aoEnviar} className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-5">
              <h2 className="font-display text-[30px] font-bold tracking-[-0.03em]">Sua bandeja</h2>
              <button type="button" onClick={onFechar} aria-label="Fechar" className="grid h-11 w-11 place-items-center rounded-full bg-branco text-tinta">
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 pb-6">
              {itens.length === 0 ? (
                <p className="rounded-2xl bg-branco px-4 py-6 text-center text-[15.5px] text-grafite">A bandeja ficou vazia. Volte à vitrine e pegue um aparelho.</p>
              ) : (
                <ul className="rounded-[20px] bg-branco pl-4 pr-1.5">
                  {itens.map((i) => (
                    <li key={i.id} className="flex items-center gap-3 border-b border-titanio py-2 last:border-0">
                      <span aria-hidden className="h-[22px] w-[22px] shrink-0 rounded-full" style={{ background: corHex(i.cor, i.nome), boxShadow: "inset 0 0 0 1px rgb(21 23 28 / 0.25)" }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15.5px] font-semibold">{i.nome}</span>
                        <span className="block truncate text-[13px] text-grafite">
                          {resumo(i)} · <Contagem ate={i.ate} className="font-mono tabular-nums" />
                        </span>
                      </span>
                      <span className="font-mono text-[15px] font-semibold">{brl(i.preco)}</span>
                      <button type="button" onClick={() => onSoltar(i)} aria-label={`Tirar ${i.nome} da bandeja`} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-grafite hover:bg-titanio">
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <fieldset>
                <legend className="font-display text-[20px] font-semibold tracking-tight">Como vai pagar?</legend>
                <div className="mt-2.5 grid gap-2">
                  {Object.entries(NOME_PAGAMENTO).map(([v, t]) => (
                    <Opcao key={v} nome="pagamento" valor={v} atual={form.pagamento} onChange={campo("pagamento")} titulo={t} nota={NOTA_PAGAMENTO[v]} />
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="font-display text-[20px] font-semibold tracking-tight">Como recebe?</legend>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {[...loja.retiradas, "Entrega"].map((v) => (
                    <Opcao key={v} nome="entrega" valor={v} atual={form.entrega} onChange={campo("entrega")} titulo={entregaTexto(v)} />
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-3">
                <p className="font-display text-[20px] font-semibold tracking-tight">Quem está comprando?</p>
                <label className="grid gap-1.5 text-[14px] font-medium text-grafite">
                  Seu nome ou o da loja
                  <input
                    value={form.nome}
                    onChange={(e) => campo("nome")(e.target.value)}
                    autoComplete="name"
                    maxLength={80}
                    className="h-13 rounded-campo border border-nevoa bg-branco px-3.5 text-[16px] font-normal text-tinta"
                  />
                </label>
                <label className="grid gap-1.5 text-[14px] font-medium text-grafite">
                  WhatsApp com DDD
                  <input
                    value={form.whatsapp}
                    onChange={(e) => campo("whatsapp")(e.target.value)}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(21) 99999-0000"
                    maxLength={20}
                    className="h-13 rounded-campo border border-nevoa bg-branco px-3.5 text-[16px] font-normal text-tinta placeholder:text-nevoa"
                  />
                </label>
                <label className="grid gap-1.5 text-[14px] font-medium text-grafite">
                  Quer deixar um recado? (opcional)
                  <textarea
                    value={form.obs}
                    onChange={(e) => campo("obs")(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="rounded-campo border border-nevoa bg-branco px-3.5 py-2.5 text-[16px] font-normal text-tinta"
                  />
                </label>
              </div>
            </div>

            <div className="shrink-0 rounded-t-[24px] bg-tinta px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
              {erro && (
                <p role="alert" className="mb-2.5 rounded-xl bg-alerta-claro px-3.5 py-2.5 text-[14.5px] text-[#a3380a]">
                  {erro}
                </p>
              )}
              <button
                type="submit"
                disabled={enviando || itens.length === 0}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ultramar text-[16.5px] font-semibold text-white transition disabled:opacity-50"
              >
                {enviando ? (
                  "Enviando…"
                ) : (
                  <>
                    <Check size={18} strokeWidth={2.6} aria-hidden /> Enviar pedido · <span className="font-mono">{brl(total)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
