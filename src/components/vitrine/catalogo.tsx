"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BatteryFull, BatteryLow, BatteryMedium, Check, ChevronDown, LayoutGrid, List, Lock, MapPin, MessageCircle, Search, Wallet, X } from "lucide-react";
import { clsx } from "clsx";
import {
  brl,
  corHex,
  faixaBateria,
  formaDe,
  luzDe,
  misturar,
  NOME_CONDICAO,
  whatsappLink,
  type DadosVitrine,
  type Forma,
  type Item,
  type Modelo,
} from "@/lib/aparelho";
import { Aparelho } from "./aparelho";
import { Contagem } from "./contagem";

export type Visao = "cartoes" | "lista";
export type Ordem = "relevancia" | "menor" | "maior" | "bateria";
export type CategoriaFiltro = { slug: string; nome: string; n: number; amostra: Item | null };

const ALTURA_CARTAO: Partial<Record<Forma, number>> = { tablet: 104, tabletIlha: 104, relogio: 112, mouse: 92, caixa: 96 };
const ALTURA_MINI: Partial<Record<Forma, number>> = { tablet: 34, tabletIlha: 34, relogio: 38, mouse: 30, caixa: 32 };

/** O fundo do cartão pega a cor do aparelho, bem clarinha. */
export function fundoDe(cor: string) {
  const tom = misturar(luzDe(cor), "#ffffff", 0.5);
  return `radial-gradient(120% 85% at 50% 100%, ${tom} 0%, ${misturar(tom, "#f4f5f7", 0.6)} 45%, #f4f5f7 80%)`;
}

const disponivel = (u: Item) => u.estado === "livre" || u.estado === "meu";

export function SeloCondicao({ condicao, escuro = false }: { condicao: string | null; escuro?: boolean }) {
  if (!condicao) return null;
  const lacrado = condicao === "lacrado";
  return (
    <span
      className={clsx(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-semibold uppercase tracking-[0.05em]",
        lacrado ? (escuro ? "bg-white text-noite" : "bg-tinta text-white") : escuro ? "border border-white/30 text-white/90" : "bg-white/85 text-tinta ring-1 ring-linha",
      )}
    >
      {NOME_CONDICAO[condicao]}
    </span>
  );
}

export function SeloBateria({ unidades, className }: { unidades: Item[]; className?: string }) {
  const texto = faixaBateria(unidades);
  if (!texto) return null;
  const menor = Math.min(...unidades.map((u) => u.bateria ?? 100));
  const Icone = menor >= 90 ? BatteryFull : menor >= 85 ? BatteryMedium : BatteryLow;
  return (
    <span
      className={clsx(
        "inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[12.5px] font-semibold tabular-nums",
        menor >= 90 ? "bg-ok-claro text-[#075c3f]" : menor >= 85 ? "bg-titanio text-tinta" : "bg-alerta-claro text-[#a3380a]",
        className,
      )}
    >
      <Icone size={15} aria-hidden /> {texto}
    </span>
  );
}

/** A loja no topo: quem é, onde retira, como paga e o WhatsApp. */
export function Cabecalho({ loja, aparelhos }: { loja: DadosVitrine["loja"]; aparelhos: number }) {
  const chip = "flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13.5px] font-medium text-tinta ring-1 ring-linha";
  return (
    <header className="pt-5">
      <div className="flex items-center gap-3.5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-ultramar font-display text-[19px] font-bold tracking-tight text-white shadow-[inset_0_-3px_0_rgb(0_0_0/0.18),0_10px_24px_-12px_#2236f0]">
          CLS
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[24px] font-bold leading-none tracking-[-0.03em]">{loja.nome}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-grafite">
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-ok opacity-60 motion-reduce:hidden" />
              <span className="h-2 w-2 rounded-full bg-ok" />
            </span>
            Revenda · {aparelhos} {aparelhos === 1 ? "aparelho" : "aparelhos"} agora
          </p>
        </div>
      </div>
      <div className="sem-barra -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
        {loja.whatsapp && (
          <a href={whatsappLink(loja.whatsapp, "Olá! Vim pela vitrine de revenda da CLS.")} target="_blank" rel="noreferrer" className={chip}>
            <MessageCircle size={16} className="text-ok" aria-hidden /> WhatsApp
          </a>
        )}
        {loja.retiradas.length > 0 && (
          <span className={chip}>
            <MapPin size={16} className="text-ultramar" aria-hidden /> Retirada em {loja.retiradas.join(" e ")}
          </span>
        )}
        <span className={chip}>
          <Wallet size={16} className="text-ultramar" aria-hidden /> Pix, dinheiro ou até 21x
        </span>
      </div>
    </header>
  );
}

/** Busca e troca entre cartões e lista. Fica presa no topo ao rolar. */
export function BarraBusca({ busca, onBusca, visao, onVisao }: { busca: string; onBusca: (v: string) => void; visao: Visao; onVisao: (v: Visao) => void }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 bg-titanio/85 px-4 pb-3 pt-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <label className="relative flex h-12 min-w-0 flex-1 items-center rounded-full bg-white shadow-[0_1px_0_rgb(0_0_0/0.04),0_8px_24px_-16px_rgb(21_23_28/0.35)] ring-1 ring-linha/70 focus-within:ring-2 focus-within:ring-ultramar">
          <Search size={18} className="pointer-events-none absolute left-4 text-grafite" aria-hidden />
          <span className="sr-only">Buscar aparelho</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => onBusca(e.target.value)}
            placeholder="Buscar modelo ou cor"
            enterKeyHint="search"
            className="h-full w-full rounded-full bg-transparent pl-11 pr-11 text-[16px] text-tinta outline-none placeholder:text-nevoa [&::-webkit-search-cancel-button]:hidden"
          />
          {busca && (
            <button type="button" onClick={() => onBusca("")} aria-label="Limpar busca" className="absolute right-1 grid h-10 w-10 place-items-center rounded-full text-grafite">
              <X size={17} />
            </button>
          )}
        </label>
        <div className="flex h-12 shrink-0 items-center rounded-full bg-white p-1 ring-1 ring-linha/70" role="group" aria-label="Como mostrar">
          {(
            [
              ["cartoes", LayoutGrid, "Ver em cartões"],
              ["lista", List, "Ver em lista"],
            ] as const
          ).map(([v, Icone, rotulo]) => (
            <button
              key={v}
              type="button"
              onClick={() => onVisao(v)}
              aria-pressed={visao === v}
              aria-label={rotulo}
              className={clsx("relative grid h-10 w-11 place-items-center rounded-full transition-colors", visao === v ? "text-white" : "text-grafite")}
            >
              {visao === v && <motion.span layoutId="visao-ativa" className="absolute inset-0 rounded-full bg-tinta" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
              <Icone size={18} className="relative" aria-hidden />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Categorias em círculos, cada uma com um aparelho dela desenhado. */
export function Categorias({ categorias, cat, onCat }: { categorias: CategoriaFiltro[]; cat: string; onCat: (slug: string) => void }) {
  return (
    <nav aria-label="Categorias" className="sem-barra -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 pt-1">
      {categorias.map((c) => {
        const ligado = cat === c.slug;
        const forma = c.amostra ? formaDe(c.amostra.nome, c.amostra.categoria) : null;
        const cor = c.amostra ? corHex(c.amostra.cor, c.amostra.nome) : "#8d929b";
        return (
          <button key={c.slug} type="button" onClick={() => onCat(c.slug)} aria-pressed={ligado} className="flex w-[78px] shrink-0 flex-col items-center gap-1.5">
            <span
              className={clsx("relative grid h-[66px] w-[66px] place-items-center rounded-full transition-shadow", ligado ? "shadow-[0_0_0_2.5px_var(--color-ultramar)]" : "shadow-[0_0_0_1px_var(--color-linha)]")}
              style={{ background: fundoDe(cor) }}
            >
              {forma ? (
                <span style={{ transform: "rotate(-8deg)" }}>
                  <Aparelho forma={forma} cor={cor} altura={ALTURA_MINI[forma] ?? 42} />
                </span>
              ) : (
                <LayoutGrid size={24} className="text-tinta" aria-hidden />
              )}
              <span className={clsx("absolute -right-1 -top-1 grid h-[22px] min-w-[22px] place-items-center rounded-full px-1 text-[11.5px] font-bold tabular-nums ring-2 ring-titanio", ligado ? "bg-ultramar text-white" : "bg-white text-tinta")}>
                {c.n}
              </span>
            </span>
            <span className={clsx("w-full truncate text-center text-[12px]", ligado ? "font-semibold text-tinta" : "text-grafite")}>{c.nome}</span>
          </button>
        );
      })}
    </nav>
  );
}

/** Condição e ordem. */
export function Controles({
  condicoes,
  condicao,
  onCondicao,
  ordem,
  onOrdem,
  resumo,
}: {
  condicoes: { v: string; nome: string; n: number }[];
  condicao: string;
  onCondicao: (v: string) => void;
  ordem: Ordem;
  onOrdem: (o: Ordem) => void;
  resumo: string;
}) {
  return (
    <div className="mt-4">
      <div className="sem-barra -mx-4 flex gap-1.5 overflow-x-auto px-4">
          {condicoes.map((c) => (
            <button
              key={c.v}
              type="button"
              aria-pressed={condicao === c.v}
              onClick={() => onCondicao(c.v)}
              className={clsx(
                "h-10 shrink-0 rounded-full px-3.5 text-[13.5px] font-medium transition-colors",
                condicao === c.v ? "bg-tinta text-white" : "bg-white text-tinta ring-1 ring-linha",
              )}
            >
              {c.nome} <span className={condicao === c.v ? "text-white/60" : "text-nevoa"}>{c.n}</span>
            </button>
          ))}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-[13px] text-grafite">{resumo}</p>
        <label className="relative shrink-0">
          <span className="sr-only">Ordenar</span>
          <select
            value={ordem}
            onChange={(e) => onOrdem(e.target.value as Ordem)}
            className="h-10 appearance-none rounded-full bg-transparent pl-3 pr-8 text-right text-[13.5px] font-semibold text-tinta"
          >
            <option value="relevancia">Relevância</option>
            <option value="menor">Menor preço</option>
            <option value="maior">Maior preço</option>
            <option value="bateria">Melhor bateria</option>
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-grafite" aria-hidden />
        </label>
      </div>
    </div>
  );
}

function Preco({ m, grande = false }: { m: Modelo; grande?: boolean }) {
  const varia = m.menor !== m.maior;
  return (
    <p className="leading-none">
      {varia && <span className="block pb-1 text-[11.5px] text-grafite">a partir de</span>}
      <span className={clsx("font-display font-bold tracking-[-0.03em] tabular-nums", grande ? "text-[24px]" : "text-[21px]")}>{brl(m.menor)}</span>
    </p>
  );
}

/** Situação do modelo quando ninguém pode pegar: todas as unidades estão com outros revendedores. */
function Ocupado({ m }: { m: Modelo }) {
  if (m.unidades.some(disponivel)) return null;
  const prazo = m.unidades.map((u) => u.ate).filter(Boolean).sort()[0] ?? null;
  return (
    <span className="absolute inset-x-2 bottom-2 flex h-8 items-center justify-center gap-1.5 rounded-full bg-tinta/85 text-[12.5px] font-medium text-white backdrop-blur">
      <Lock size={13} aria-hidden />
      {prazo ? (
        <>
          Segurado · <Contagem ate={prazo} className="font-mono tabular-nums" />
        </>
      ) : (
        "Em pedido"
      )}
    </span>
  );
}

/** O aparelho desenhado (ou a foto real) de uma unidade, inclinado como num anúncio. */
function PecaCartao({ u, altura, atras = false }: { u: Item; altura?: number; atras?: boolean }) {
  const forma = formaDe(u.nome, u.categoria);
  const h = altura ?? ALTURA_CARTAO[forma] ?? 128;
  if (u.foto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={u.foto} alt="" draggable={false} className="rounded-[14px] object-cover shadow-[0_18px_30px_-14px_rgb(21_23_28/0.6)]" style={{ height: h, width: h * 0.66 }} />
    );
  }
  return (
    <span
      className="block"
      style={{
        transform: atras ? "perspective(700px) rotateY(-26deg) rotateZ(6deg)" : "perspective(700px) rotateY(-16deg) rotateX(4deg) rotateZ(-5deg)",
        filter: `drop-shadow(0 18px 16px rgb(21 23 28 / ${atras ? 0.22 : 0.38}))`,
      }}
    >
      <Aparelho forma={forma} cor={corHex(u.cor, u.nome)} altura={h} />
    </span>
  );
}

/** Cartão de um modelo. Arrastar a foto troca a unidade; tocar abre o palco. */
export function CartaoModelo({
  m,
  escondePeca,
  indice,
  parado,
  onAbrir,
}: {
  m: Modelo;
  escondePeca: boolean;
  indice: number;
  parado: boolean;
  onAbrir: (unidade: string) => void;
}) {
  const [i, setI] = useState(() => Math.max(0, m.unidades.findIndex(disponivel)));
  const [arrastou, setArrastou] = useState(false);
  const u = m.unidades[i % m.unidades.length];
  const outra = m.unidades.length > 1 ? m.unidades[(i + 1) % m.unidades.length] : null;
  const cor = corHex(u.cor, u.nome);
  const cores = [...new Set(m.unidades.map((x) => x.cor ?? ""))].filter(Boolean);
  const meus = m.unidades.filter((x) => x.estado === "meu" || x.estado === "pedido").length;
  const livre = m.unidades.some(disponivel);
  const linha = [m.armazenamento, m.detalhe, m.unidades.length > 1 ? `${m.unidades.length} unidades` : u.cor].filter(Boolean).join(" · ");
  const rotulo = `${m.nome}${m.armazenamento ? ", " + m.armazenamento : ""}, ${m.unidades.length === 1 ? "1 unidade" : m.unidades.length + " unidades"}, ${m.menor !== m.maior ? "a partir de " : ""}${brl(m.menor)}`;

  return (
    <motion.article
      initial={parado ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(indice * 0.035, 0.5), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      onTap={() => {
        if (!arrastou) onAbrir(u.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAbrir(u.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={rotulo}
      className={clsx("cursor-pointer overflow-hidden rounded-[24px] bg-white p-1.5 shadow-[0_1px_0_rgb(0_0_0/0.04),0_14px_30px_-22px_rgb(21_23_28/0.5)]", !livre && "opacity-75")}
    >
      <motion.div
        drag={m.unidades.length > 1 ? "x" : false}
        dragSnapToOrigin
        dragElastic={0.25}
        onDragStart={() => setArrastou(true)}
        onDragEnd={(_, info) => {
          if (info.offset.x < -36) setI((v) => v + 1);
          else if (info.offset.x > 36) setI((v) => (v - 1 + m.unidades.length) % m.unidades.length);
          setTimeout(() => setArrastou(false), 60);
        }}
        className="relative grid h-[188px] place-items-center overflow-hidden rounded-[19px] transition-[background] duration-500"
        style={{ background: fundoDe(cor), touchAction: "pan-y" }}
      >
        <span aria-hidden className="absolute bottom-5 left-1/2 h-4 w-[56%] -translate-x-1/2 rounded-[50%] bg-tinta/20 blur-md" />
        {outra && !escondePeca && (
          <span aria-hidden className="absolute left-[54%] top-1/2 -translate-y-[54%] opacity-90">
            <PecaCartao u={outra} altura={Math.round((ALTURA_CARTAO[formaDe(outra.nome, outra.categoria)] ?? 128) * 0.84)} atras />
          </span>
        )}
        {!escondePeca && (
          <motion.span layoutId={`peca-${m.chave}`} className="relative -translate-x-[8%]" transition={{ type: "spring", stiffness: 260, damping: 30 }}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={u.id}
                className="block"
                initial={parado ? false : { opacity: 0, x: 26, rotate: 6 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -26, rotate: -6 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <PecaCartao u={u} />
              </motion.span>
            </AnimatePresence>
          </motion.span>
        )}
        <span className="absolute left-2 top-2">
          <SeloCondicao condicao={m.condicao} />
        </span>
        {meus > 0 && (
          <span className="absolute right-2 top-2 inline-flex h-6 items-center gap-1 rounded-full bg-ultramar px-2 text-[11.5px] font-semibold text-white">
            <Check size={12} strokeWidth={3} aria-hidden /> {meus > 1 ? `${meus} seus` : "Seu"}
          </span>
        )}
        {m.unidades.length > 1 && livre && (
          <span aria-hidden className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1">
            {m.unidades.slice(0, 6).map((x, n) => (
              <span key={x.id} className={clsx("h-1.5 rounded-full transition-all duration-300", n === i % m.unidades.length ? "w-4 bg-tinta" : "w-1.5 bg-tinta/25")} />
            ))}
          </span>
        )}
        <Ocupado m={m} />
      </motion.div>

      <div className="px-2 pb-2 pt-2.5">
        <h3 className="line-clamp-2 text-[15.5px] font-semibold leading-[1.18] tracking-[-0.01em]">{m.nome}</h3>
        <p className="mt-1 truncate text-[12.5px] text-grafite">{linha}</p>
        <div className="mt-2 flex min-h-6 flex-wrap items-center gap-1.5">
          <SeloBateria unidades={m.unidades} />
          {cores.length > 1 && (
            <span aria-hidden className="flex -space-x-1">
              {cores.slice(0, 5).map((c) => (
                <span key={c} className="h-[18px] w-[18px] rounded-full ring-2 ring-white" style={{ background: corHex(c, m.nome), boxShadow: "inset 0 0 0 1px rgb(21 23 28 / 0.18)" }} />
              ))}
            </span>
          )}
        </div>
        <div className="mt-2.5">
          <Preco m={m} />
        </div>
      </div>
    </motion.article>
  );
}

/** Linha de uma unidade na visão em lista: tudo à mão para pegar sem abrir nada. */
function LinhaUnidade({ u, onAbrir, onPegar, onSoltar }: { u: Item; onAbrir: () => void; onPegar: (el: HTMLElement) => void; onSoltar: () => void }) {
  const cor = corHex(u.cor, u.nome);
  return (
    <li className="flex items-center gap-2 py-1.5">
      <button type="button" onClick={onAbrir} className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl px-1 text-left">
        <span aria-hidden className="h-5 w-5 shrink-0 rounded-full" style={{ background: cor, boxShadow: "inset 0 0 0 1px rgb(21 23 28 / 0.2)" }} />
        <span className="min-w-0">
          <span className="block truncate text-[14.5px] font-medium">
            {u.cor ?? "Sem cor informada"}
            {u.bateria != null && <span className={clsx("ml-1.5 tabular-nums", u.bateria < 85 ? "text-[#a3380a]" : "text-grafite")}>· {u.bateria}%</span>}
          </span>
          <span className="block font-display text-[16px] font-bold tabular-nums tracking-[-0.02em]">{brl(u.preco)}</span>
        </span>
      </button>
      {u.estado === "livre" && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={(e) => onPegar(e.currentTarget)}
          className="h-11 shrink-0 rounded-full bg-ultramar px-5 text-[14.5px] font-semibold text-white shadow-[0_8px_18px_-10px_#2236f0]"
        >
          Pegar
        </motion.button>
      )}
      {u.estado === "meu" && (
        <button type="button" onClick={onSoltar} className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-ultramar-claro px-3.5 text-[14px] font-semibold text-ultramar-escuro" aria-label={`É seu. Toque para soltar ${u.nome} ${u.cor ?? ""}`}>
          <Check size={16} strokeWidth={2.8} aria-hidden /> <Contagem ate={u.ate} className="font-mono tabular-nums" />
        </button>
      )}
      {u.estado === "pedido" && <span className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-titanio px-3.5 text-[13.5px] font-medium text-tinta">No seu pedido</span>}
      {u.estado === "segurado" && (
        <span className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-titanio px-3.5 text-[13.5px] text-grafite">
          <Lock size={14} aria-hidden /> {u.ate ? <Contagem ate={u.ate} className="font-mono tabular-nums" /> : "Em pedido"}
        </span>
      )}
    </li>
  );
}

/** Modelo na visão em lista: abre e mostra cada unidade com o botão Pegar. */
export function LinhaModelo({
  m,
  aberto,
  onAlternar,
  onAbrir,
  onPegar,
  onSoltar,
}: {
  m: Modelo;
  aberto: boolean;
  onAlternar: () => void;
  onAbrir: (unidade: string) => void;
  onPegar: (u: Item, el: HTMLElement) => void;
  onSoltar: (u: Item) => void;
}) {
  const u = m.unidades[0];
  const forma = formaDe(u.nome, u.categoria);
  const cor = corHex(u.cor, u.nome);
  const livres = m.unidades.filter(disponivel).length;
  return (
    <li className="overflow-hidden rounded-[22px] bg-white shadow-[0_1px_0_rgb(0_0_0/0.04),0_10px_24px_-20px_rgb(21_23_28/0.5)]">
      <button type="button" onClick={onAlternar} aria-expanded={aberto} className="flex w-full items-center gap-3 p-2.5 pr-3.5 text-left">
        <span className="grid h-[60px] w-[60px] shrink-0 place-items-center overflow-hidden rounded-[16px]" style={{ background: fundoDe(cor) }}>
          {u.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.foto} alt="" className="h-full w-full object-cover" />
          ) : (
            <span style={{ transform: "rotate(-8deg)" }}>
              <Aparelho forma={forma} cor={cor} altura={ALTURA_MINI[forma] ? ALTURA_MINI[forma]! + 6 : 46} />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15.5px] font-semibold tracking-[-0.01em]">{m.nome}</span>
          <span className="mt-0.5 block truncate text-[12.5px] text-grafite">
            {[m.armazenamento, m.detalhe].filter(Boolean).join(" · ")}
            {m.armazenamento || m.detalhe ? " · " : ""}
            {livres === 0 ? "todos segurados" : m.unidades.length === 1 ? "1 unidade" : `${m.unidades.length} unidades`}
          </span>
          <span className="mt-1.5 flex items-center gap-1.5">
            <SeloCondicao condicao={m.condicao} />
            <SeloBateria unidades={m.unidades} />
          </span>
        </span>
        <span className="shrink-0 text-right">
          <Preco m={m} />
        </span>
        <ChevronDown size={18} aria-hidden className={clsx("shrink-0 text-grafite transition-transform duration-300", aberto && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {aberto && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <ul className="mx-2.5 mb-2.5 divide-y divide-titanio rounded-[16px] bg-vidro px-2.5">
              {m.unidades.map((x) => (
                <LinhaUnidade key={x.id} u={x} onAbrir={() => onAbrir(x.id)} onPegar={(el) => onPegar(x, el)} onSoltar={() => onSoltar(x)} />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
