"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

/**
 * Demonstração viva do que o sistema faz: uma linha bruta da lista do
 * fornecedor é lida e vira uma ficha organizada. O que não está escrito
 * na linha aparece como "não informado" e manda o item para revisão.
 * Os aparelhos e valores são apenas exemplos.
 */

type Campo = { rotulo: string; valor: string | null };
type Linha = { bruto: string; campos: Campo[] };

const LINHAS: Linha[] = [
  {
    bruto: "16PM 256 desert lacr 6.900",
    campos: [
      { rotulo: "Modelo", valor: "iPhone 16 Pro Max" },
      { rotulo: "Memória", valor: "256 GB" },
      { rotulo: "Cor", valor: "Titânio-deserto" },
      { rotulo: "Condição", valor: "Lacrado" },
      { rotulo: "Custo", valor: "R$ 6.900" },
    ],
  },
  {
    bruto: "S25 ULTRA 512 preto semi 5200",
    campos: [
      { rotulo: "Modelo", valor: "Galaxy S25 Ultra" },
      { rotulo: "Memória", valor: "512 GB" },
      { rotulo: "Cor", valor: "Preto" },
      { rotulo: "Condição", valor: "Seminovo" },
      { rotulo: "Custo", valor: "R$ 5.200" },
    ],
  },
  {
    bruto: "17 PRO 256 AZUL 7350",
    campos: [
      { rotulo: "Modelo", valor: "iPhone 17 Pro" },
      { rotulo: "Memória", valor: "256 GB" },
      { rotulo: "Cor", valor: "Azul-profundo" },
      { rotulo: "Condição", valor: null },
      { rotulo: "Custo", valor: "R$ 7.350" },
    ],
  },
  {
    bruto: "ip 15 128 rosa cpo 3.180",
    campos: [
      { rotulo: "Modelo", valor: "iPhone 15" },
      { rotulo: "Memória", valor: "128 GB" },
      { rotulo: "Cor", valor: "Rosa" },
      { rotulo: "Condição", valor: "CPO" },
      { rotulo: "Custo", valor: "R$ 3.180" },
    ],
  },
];

type Fase = "apontando" | "lendo" | "pronto";

export function ListaViva() {
  const reduzir = useReducedMotion();
  const [atual, setAtual] = useState(0);
  const [fase, setFase] = useState<Fase>("apontando");

  useEffect(() => {
    const proximo = () => setAtual((n) => (n + 1) % LINHAS.length);
    if (reduzir) {
      setFase("pronto");
      const t = setTimeout(proximo, 5200);
      return () => clearTimeout(t);
    }
    setFase("apontando");
    const timers = [
      setTimeout(() => setFase("lendo"), 650),
      setTimeout(() => setFase("pronto"), 1650),
      setTimeout(proximo, 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [atual, reduzir]);

  const linha = LINHAS[atual];
  const faltando = linha.campos.some((c) => c.valor === null);

  return (
    <div className="w-full max-w-[440px]" aria-label="Exemplo: uma lista do fornecedor sendo organizada" role="img">
      {/* Mensagem do fornecedor */}
      <div className="rounded-[22px] rounded-bl-md bg-branco/90 p-4 shadow-[0_1px_0_rgb(255_255_255/0.8)_inset,0_12px_32px_-18px_rgb(21_23_28/0.45)] ring-1 ring-linha/70 backdrop-blur">
        <p className="mb-2.5 text-[13px] font-medium text-grafite">Fornecedor A, hoje às 08:14</p>
        <ul className="space-y-1 font-mono text-[13.5px] leading-6 text-tinta">
          {LINHAS.map((l, i) => (
            <li key={l.bruto} className="relative px-2">
              {i === atual && (
                <motion.span
                  layoutId="marcador"
                  className="absolute inset-0 -z-0 rounded-md bg-ultramar-claro"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
              <span className={clsx("relative", i === atual ? "text-ultramar-escuro" : "text-grafite")}>{l.bruto}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ficha organizada */}
      <div className="relative mt-4 overflow-hidden rounded-[22px] bg-tinta p-5 text-white shadow-[0_24px_48px_-24px_rgb(21_23_28/0.7)]">
        <AnimatePresence>
          {fase === "lendo" && (
            <motion.span
              key={`scan-${atual}`}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-ultramar/50 to-transparent"
              initial={{ x: "-30%" }}
              animate={{ x: "520%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.95, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        <div className="relative flex items-center justify-between">
          <p className="text-[13px] text-white/60">
            {fase === "apontando" ? "Lendo a linha" : fase === "lendo" ? "Separando os campos" : "Ficha pronta"}
          </p>
          <AnimatePresence mode="wait">
            {fase === "pronto" && (
              <motion.span
                key={`status-${atual}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={clsx(
                  "rounded-full px-2.5 py-1 text-[12px] font-semibold",
                  faltando ? "bg-alerta text-white" : "bg-ok text-white",
                )}
              >
                {faltando ? "Vai para revisão" : "Pronto para aprovar"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <dl className="relative mt-4 grid grid-cols-[88px_1fr] gap-x-4 gap-y-2.5 text-[15px]">
          {linha.campos.map((c, i) => (
            <div key={`${atual}-${c.rotulo}`} className="contents">
              <dt className="text-white/50">{c.rotulo}</dt>
              <motion.dd
                initial={reduzir ? false : { opacity: 0, x: -8 }}
                animate={fase === "apontando" ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
                transition={{ delay: fase === "apontando" ? 0 : 0.25 + i * 0.11, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={clsx("font-medium", c.valor === null ? "text-[#ff9a63]" : "text-white")}
              >
                {c.valor ?? "não informada na lista"}
              </motion.dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
