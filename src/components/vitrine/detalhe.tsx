"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Lock, RotateCw, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";
import { brl, corHex, luzDe, type Item, type Modelo } from "@/lib/aparelho";
import { Bateria, MOLA, PecaViva, useInclinacao } from "./palco";
import { SeloCondicao } from "./catalogo";
import { Contagem } from "./contagem";

/**
 * O palco: o aparelho sai do cartão e sobe para um fundo escuro com a luz da cor dele.
 * Inclina com o celular, vira com um toque, troca de unidade com um arrasto.
 */
export function Detalhe({
  m,
  unidadeId,
  noCarrinho,
  minutos,
  parado,
  onUnidade,
  onPegar,
  onSoltar,
  onFechar,
  onBandeja,
}: {
  m: Modelo;
  unidadeId: string;
  noCarrinho: number;
  minutos: number;
  parado: boolean;
  onUnidade: (id: string) => void;
  onPegar: (u: Item) => void;
  onSoltar: (u: Item) => void;
  onFechar: () => void;
  onBandeja: () => void;
}) {
  const u = m.unidades.find((x) => x.id === unidadeId) ?? m.unidades[0];
  const n = m.unidades.indexOf(u);
  const [dir, setDir] = useState(1);
  const [festa, setFesta] = useState(0);
  const { inclinaX, inclinaY, onPointerMove, onPointerLeave } = useInclinacao(parado);
  const cor = corHex(u.cor, u.nome);
  const luz = luzDe(cor);
  const fechar = useRef(onFechar);
  fechar.current = onFechar;

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && fechar.current();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  const vizinho = (passo: 1 | -1) => {
    if (m.unidades.length < 2) return;
    setDir(passo);
    onUnidade(m.unidades[(n + passo + m.unidades.length) % m.unidades.length].id);
  };

  const pegar = () => {
    setFesta((f) => f + 1);
    onPegar(u);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${m.nome}${m.armazenamento ? " " + m.armazenamento : ""}`}
      className="vitrine fixed inset-0 z-40 flex flex-col overflow-hidden bg-noite text-white lg:inset-6 lg:mx-auto lg:max-w-[1120px] lg:rounded-[32px] lg:shadow-[0_40px_120px_-30px_rgb(0_0_0/0.8)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.05 } }}
      transition={{ duration: 0.3 }}
    >
      {/* A luz do palco tem a cor do aparelho */}
      <AnimatePresence initial={false}>
        <motion.div
          key={u.id}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(70% 46% at 50% 30%, ${luz}70 0%, ${luz}20 45%, transparent 75%), radial-gradient(50% 30% at 90% 0%, ${luz}30, transparent 70%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        />
      </AnimatePresence>

      {/* Topo */}
      <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 px-3 pt-[max(12px,env(safe-area-inset-top))] lg:px-6 lg:pt-5">
        <button type="button" onClick={onFechar} aria-label="Voltar ao catálogo" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/16">
          <ChevronDown size={22} />
        </button>
        {m.unidades.length > 1 && (
          <p className="text-[13.5px] tabular-nums text-white/70">
            Unidade {n + 1} de {m.unidades.length}
          </p>
        )}
        <button
          type="button"
          onClick={onBandeja}
          disabled={noCarrinho === 0}
          aria-label={noCarrinho ? `Abrir a bandeja com ${noCarrinho} ${noCarrinho === 1 ? "aparelho" : "aparelhos"}` : "Bandeja vazia"}
          className={clsx("relative grid h-11 w-11 place-items-center rounded-full backdrop-blur transition", noCarrinho ? "bg-white text-noite" : "bg-white/10 text-white/50")}
        >
          <ShoppingBag size={19} />
          <AnimatePresence>
            {noCarrinho > 0 && (
              <motion.span
                key={noCarrinho}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 18 }}
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ultramar px-1 text-[11.5px] font-bold text-white"
              >
                {noCarrinho}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center lg:overflow-hidden">
        {/* O palco */}
        <div className="relative shrink-0 select-none" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
          <div className="detalhe-peca relative grid place-items-center" style={{ perspective: 1100, height: "calc(var(--u) * 112)" }}>
            <span aria-hidden className="absolute bottom-[2%] left-1/2 h-[7%] w-[46%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-xl" />
            <motion.div layoutId={`peca-${m.chave}`} transition={{ type: "spring", stiffness: 260, damping: 30 }} style={{ transformStyle: "preserve-3d" }}>
              <AnimatePresence initial={false} mode="popLayout" custom={dir}>
                <motion.div
                  key={u.id}
                  custom={dir}
                  variants={{
                    entra: (d: number) => ({ x: d * 140, rotateY: d * 60, opacity: 0, scale: 0.86 }),
                    centro: { x: 0, rotateY: 0, opacity: 1, scale: 1 },
                    sai: (d: number) => ({ x: d * -140, rotateY: d * -60, opacity: 0, scale: 0.86 }),
                  }}
                  initial="entra"
                  animate="centro"
                  exit="sai"
                  transition={parado ? { duration: 0 } : MOLA}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <PecaViva item={u} inclinaX={inclinaX} inclinaY={inclinaY} parado={parado} onVizinho={vizinho} />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Explosão de luz quando pega */}
            <AnimatePresence>
              {festa > 0 && !parado && (
                <motion.span
                  key={festa}
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ boxShadow: `0 0 0 3px ${luz}, 0 0 60px 10px ${luz}` }}
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: 2.6, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </AnimatePresence>
          </div>
          <p className="relative flex items-center justify-center gap-1.5 pb-1 text-[12.5px] text-white/50">
            <RotateCw size={13} aria-hidden /> Toque para virar{m.unidades.length > 1 ? " · arraste para trocar" : ""}
          </p>
        </div>

        {/* A ficha */}
        <motion.div
          className="relative px-5 pb-6 pt-3 lg:max-h-full lg:overflow-y-auto lg:px-10 lg:py-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <SeloCondicao condicao={m.condicao} escuro />
            {m.categoria_nome && <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-white/55">{m.categoria_nome}</span>}
          </div>
          <h2 className="mt-2.5 text-balance font-display text-[34px] font-bold leading-[0.98] tracking-[-0.035em] lg:text-[48px]">{m.nome}</h2>
          {(m.armazenamento || m.detalhe) && <p className="mt-2 text-[16px] text-white/75">{[m.armazenamento, m.detalhe].filter(Boolean).join(" · ")}</p>}

          {m.unidades.length > 1 ? (
            <div className="mt-5">
              <p className="text-[13px] font-medium text-white/60">Escolha a unidade</p>
              <div className="sem-barra -mx-5 mt-2 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
                {m.unidades.map((x, k) => {
                  const ligado = x.id === u.id;
                  return (
                    <button
                      key={x.id}
                      type="button"
                      aria-pressed={ligado}
                      onClick={() => {
                        setDir(k >= n ? 1 : -1);
                        onUnidade(x.id);
                      }}
                      className={clsx(
                        "relative flex h-12 shrink-0 items-center gap-2 rounded-2xl px-3.5 text-[14.5px] transition",
                        ligado ? "bg-white/14" : "bg-white/6 hover:bg-white/10",
                        x.estado === "segurado" && "opacity-55",
                      )}
                    >
                      {ligado && <motion.span layoutId="unidade-ativa" className="absolute inset-0 rounded-2xl ring-2 ring-ultramar-luz" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                      <span aria-hidden className="h-4 w-4 rounded-full ring-1 ring-white/40" style={{ background: corHex(x.cor, x.nome) }} />
                      <span className="font-medium">{x.cor ?? "Unidade " + (k + 1)}</span>
                      {x.bateria != null && <span className={clsx("tabular-nums", x.bateria < 85 ? "text-[#ffb45c]" : "text-white/65")}>{x.bateria}%</span>}
                      {x.estado === "segurado" && <Lock size={13} aria-label="segurado" />}
                      {(x.estado === "meu" || x.estado === "pedido") && <Check size={14} strokeWidth={3} className="text-ultramar-luz" aria-label="sua" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            u.cor && (
              <p className="mt-3 flex items-center gap-2 text-[16px] text-white/80">
                <span aria-hidden className="h-4 w-4 rounded-full ring-1 ring-white/40" style={{ background: cor }} />
                {u.cor}
              </p>
            )
          )}

          {u.bateria != null && (
            <div className="mt-5">
              <Bateria key={u.id} valor={u.bateria} parado={parado} />
            </div>
          )}

          <p className="mt-5 flex flex-wrap items-baseline gap-x-2 font-display text-[38px] font-bold leading-none tracking-[-0.035em] tabular-nums lg:text-[52px]">
            {brl(u.preco)}
            {u.preco_de && <s className="text-[17px] font-medium text-white/50">{brl(u.preco_de)}</s>}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">Pix ou dinheiro pelo valor da vitrine. Cartão em até 21x com a taxa da máquina.</p>

          {/* Ação: no celular fica presa embaixo; no computador, logo depois do preço */}
          <div className="sticky bottom-0 -mx-5 mt-7 bg-noite px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0">
            {u.estado === "livre" && (
              <motion.button
                type="button"
                onClick={pegar}
                whileTap={{ scale: 0.97 }}
                className="flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-ultramar text-[17px] font-semibold text-white shadow-[0_16px_36px_-14px_#2236f0,inset_0_1px_0_rgb(255_255_255/0.25)] transition hover:bg-[#2c40ff]"
              >
                Pegar este <span className="text-[14.5px] font-normal text-white/80">· fica seu por {minutos} min</span>
              </motion.button>
            )}
            {u.estado === "meu" && (
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={onBandeja}
                  initial={parado ? false : { scale: 0.92 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="flex h-[58px] min-w-0 flex-1 flex-col items-center justify-center rounded-2xl bg-white text-noite"
                >
                  <span className="flex items-center gap-1.5 text-[16px] font-semibold">
                    <Check size={18} strokeWidth={2.8} className="text-ultramar" aria-hidden /> É seu · fechar pedido
                  </span>
                  <span className="text-[12.5px] text-grafite">
                    seguro por <Contagem ate={u.ate} className="font-mono tabular-nums" />
                  </span>
                </motion.button>
                <button type="button" onClick={() => onSoltar(u)} className="h-[58px] shrink-0 rounded-2xl border border-white/25 px-4 text-[15px] font-medium text-white transition hover:bg-white/8">
                  Soltar
                </button>
              </div>
            )}
            {u.estado === "pedido" && (
              <p className="flex h-[58px] items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 text-[15.5px] font-semibold">
                <Check size={18} strokeWidth={2.6} className="shrink-0 text-ultramar-luz" />
                No seu pedido · {u.ate ? <Contagem ate={u.ate} className="font-mono tabular-nums" /> : "aguardando a loja"}
              </p>
            )}
            {u.estado === "segurado" && (
              <p className="flex h-[58px] items-center justify-center gap-2 rounded-2xl bg-white/8 px-3 text-[15px] text-white/80">
                <Lock size={16} className="shrink-0" />
                {u.ate ? (
                  <>
                    Segurado por outro revendedor · <Contagem ate={u.ate} className="font-mono tabular-nums text-white" />
                  </>
                ) : (
                  "No pedido de outro revendedor"
                )}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
