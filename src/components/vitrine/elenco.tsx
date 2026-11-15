"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Lock, SlidersHorizontal } from "lucide-react";
import { clsx } from "clsx";
import { brl, corHex, formaDe, luzDe, resumo, type Forma, type Item } from "@/lib/aparelho";
import { Aparelho } from "./aparelho";
import { Contagem } from "./contagem";

export type Categoria = { slug: string; nome: string; n: number };

const ALTURA_MINI: Partial<Record<Forma, number>> = { tablet: 44, tabletIlha: 44, relogio: 50, mouse: 40, caixa: 46 };
const ROTULO_ESTADO = { livre: "", meu: ", na sua bandeja", pedido: ", no seu pedido", segurado: ", segurado por outro revendedor" };

/** Categorias e o teto de preço. O teto não esconde nada: só apaga o que passa do valor. */
export function Filtros({
  categorias,
  cat,
  onCat,
  teto,
  faixa,
  onTeto,
}: {
  categorias: Categoria[];
  cat: string;
  onCat: (slug: string) => void;
  teto: number;
  faixa: [number, number];
  onTeto: (v: number) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const comTeto = teto < faixa[1];
  const chip = (ligado: boolean) =>
    clsx(
      "flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14.5px] font-medium transition-colors",
      ligado ? "bg-white text-noite" : "bg-white/8 text-white/85 hover:bg-white/14",
    );

  return (
    <div className="shrink-0">
      <div className="sem-barra flex items-center gap-2 overflow-x-auto px-4 pb-3 pt-4">
        {categorias.map((c) => (
          <button key={c.slug} type="button" aria-pressed={cat === c.slug} onClick={() => onCat(c.slug)} className={chip(cat === c.slug)}>
            {c.nome}
            <span className={clsx("font-mono text-[12.5px]", cat === c.slug ? "text-noite/60" : "text-white/55")}>{c.n}</span>
          </button>
        ))}
        {faixa[1] > faixa[0] && (
          <button type="button" aria-expanded={aberto} onClick={() => setAberto((v) => !v)} className={chip(comTeto)}>
            <SlidersHorizontal size={15} aria-hidden />
            {comTeto ? `Até ${brl(teto)}` : "Preço"}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {aberto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-3">
              <label htmlFor="teto" className="flex items-baseline justify-between text-[14px] text-white/70">
                Até quanto por aparelho?
                <output className="font-mono text-[17px] font-semibold text-white">{brl(teto)}</output>
              </label>
              <input
                id="teto"
                type="range"
                min={faixa[0]}
                max={faixa[1]}
                step={50}
                value={teto}
                onChange={(e) => onTeto(Number(e.target.value))}
                className="mt-1 h-11 w-full accent-[#98a2ff]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** O elenco: todas as unidades de uma vez, como numa tela de escolha de personagem. */
export function Elenco({
  itens,
  sel,
  teto,
  parado,
  onSel,
}: {
  itens: Item[];
  sel: string | null;
  teto: number;
  parado: boolean;
  onSel: (id: string) => void;
}) {
  if (!itens.length) {
    return <p className="px-6 py-10 text-center text-[15.5px] text-white/65">Nada nesta categoria agora. Veja as outras.</p>;
  }

  return (
    <ul className="grid grid-cols-5 gap-2 px-4 pb-4 sm:grid-cols-6 lg:grid-cols-5 lg:gap-2.5">
      {itens.map((i, n) => {
        const forma = formaDe(i.nome, i.categoria);
        const cor = corHex(i.cor, i.nome);
        const ligado = i.id === sel;
        const caro = i.preco > teto;
        const preso = i.estado === "segurado";
        return (
          <motion.li
            key={i.id}
            initial={parado ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(n * 0.022, 0.4), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={() => onSel(i.id)}
              aria-pressed={ligado}
              aria-label={`${i.nome}, ${resumo(i)}, ${brl(i.preco)}${ROTULO_ESTADO[i.estado]}`}
              className={clsx(
                "relative flex w-full flex-col items-center gap-1.5 rounded-2xl pb-2 pt-3 transition-[opacity,background-color] duration-300",
                ligado ? "bg-white/12" : "bg-white/[0.045] hover:bg-white/9",
                caro && !ligado && "opacity-30",
              )}
            >
              {ligado && (
                <motion.span
                  layoutId="cursor-elenco"
                  aria-hidden
                  className="absolute inset-0 rounded-2xl ring-2 ring-ultramar-luz"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative grid h-[58px] place-items-center">
                <span aria-hidden className="absolute h-10 w-10 rounded-full blur-md" style={{ background: luzDe(cor), opacity: ligado ? 0.5 : 0.22 }} />
                <span className={clsx("relative transition-opacity", preso && "opacity-35")}>
                  {i.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.foto} alt="" className="h-[54px] w-[38px] rounded-lg object-cover" />
                  ) : (
                    <Aparelho forma={forma} cor={cor} altura={ALTURA_MINI[forma] ?? 54} />
                  )}
                </span>
                {preso && <Lock size={16} aria-hidden className="absolute text-white" />}
              </span>
              <span className="relative font-mono text-[11.5px] font-medium tabular-nums text-white/90">
                {preso ? <Contagem ate={i.ate} /> : i.preco.toLocaleString("pt-BR")}
              </span>
              {i.bateria != null && (
                <span className={clsx("absolute right-1.5 top-1 font-mono text-[10.5px] tabular-nums", i.bateria < 85 ? "text-[#ffb45c]" : "text-white/65")}>
                  {i.bateria}
                </span>
              )}
              {(i.estado === "meu" || i.estado === "pedido") && (
                <span className={clsx("absolute left-1.5 top-1.5 grid h-[18px] w-[18px] place-items-center rounded-full text-white", i.estado === "meu" ? "bg-ultramar" : "bg-white/30")}>
                  <Check size={12} strokeWidth={3} aria-hidden />
                </span>
              )}
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
