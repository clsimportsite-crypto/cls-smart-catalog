"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTime,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Check, ChevronLeft, ChevronRight, Lock, RotateCw } from "lucide-react";
import { brl, corHex, formaDe, luzDe, NOME_CONDICAO, type Forma, type Item } from "@/lib/aparelho";
import { Aparelho } from "./aparelho";
import { Contagem } from "./contagem";

const U = (n: number) => `calc(var(--u) * ${n})`;
const MOLA = { type: "spring", stiffness: 260, damping: 26 } as const;
const TEM_TELA: Forma[] = ["duoV", "duoD", "pilula", "solo", "tri", "barra", "triV", "tablet", "tabletIlha"];
// Peças mais largas ficam um pouco menores para caber ao lado da ficha.
const ESCALA: Partial<Record<Forma, number>> = { tablet: 0.8, tabletIlha: 0.8, relogio: 0.86, mouse: 0.72, caixa: 0.8 };

/** O que a tela do aparelho mostra quando ele é virado de frente: a própria ficha. */
function TelaFicha({ item }: { item: Item }) {
  const baixa = item.bateria != null && item.bateria < 85;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white" style={{ gap: U(2.2), padding: U(4.5) }}>
      {item.bateria != null ? (
        <svg viewBox="0 0 100 100" style={{ width: U(30), height: U(30) }} role="img" aria-label={`Bateria ${item.bateria}%`}>
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(255 255 255 / 0.14)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={baixa ? "#ffb45c" : "#46e0a0"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${item.bateria * 2.639} 264`}
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="60" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="700" style={{ fontFamily: "var(--font-bricolage)" }}>
            {item.bateria}
          </text>
        </svg>
      ) : (
        <span className="font-display font-bold" style={{ fontSize: U(6.4), lineHeight: 1 }}>
          {item.condicao === "lacrado" ? "Lacrado" : "Unidade única"}
        </span>
      )}
      {item.bateria != null && <span style={{ fontSize: U(3.5), opacity: 0.65 }}>de bateria</span>}
      {item.armazenamento && (
        <span className="font-display font-semibold" style={{ fontSize: U(5.2), lineHeight: 1 }}>
          {item.armazenamento}
        </span>
      )}
      <span style={{ fontSize: U(3.3), opacity: 0.6, lineHeight: 1.25 }}>
        {[item.cor, item.condicao ? NOME_CONDICAO[item.condicao] : null].filter(Boolean).join(" · ")}
      </span>
    </div>
  );
}

/** A peça viva: flutua, inclina com o mouse ou o giroscópio, vira com um toque, troca com um arrasto. */
function PecaViva({
  item,
  inclinaX,
  inclinaY,
  parado,
  onVizinho,
}: {
  item: Item;
  inclinaX: MotionValue<number>;
  inclinaY: MotionValue<number>;
  parado: boolean;
  onVizinho: (passo: 1 | -1) => void;
}) {
  const forma = formaDe(item.nome, item.categoria);
  const cor = corHex(item.cor, item.nome);
  const podeVirar = TEM_TELA.includes(forma);
  const [virado, setVirado] = useState(false);

  const tempo = useTime();
  const arrasto = useMotionValue(0);
  const giroY = useTransform(() => inclinaX.get() * 20 + arrasto.get() * 0.22 + (parado ? 0 : Math.sin(tempo.get() / 1700) * 9));
  const giroX = useTransform(() => inclinaY.get() * -13 + (parado ? 0 : Math.cos(tempo.get() / 2300) * 3.5));
  const flutua = useTransform(() => (parado ? 0 : Math.sin(tempo.get() / 1500) * 6));
  const brilhoX = useTransform(() => `${40 - giroY.get() * 2.2}%`);
  const brilhoY = useTransform(() => `${24 + giroX.get() * 2.4}%`);

  const escala = ESCALA[forma] ?? 1;
  const face: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
  const frente = item.foto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.foto}
      alt={`Foto real: ${item.nome}`}
      draggable={false}
      className="object-cover shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)]"
      style={{ width: U(66), height: U(100), borderRadius: U(7) }}
    />
  ) : (
    <Aparelho forma={forma} cor={cor} />
  );

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={(_, info) => {
        if (info.offset.x < -64 || info.velocity.x < -520) onVizinho(1);
        else if (info.offset.x > 64 || info.velocity.x > 520) onVizinho(-1);
      }}
      onTap={() => podeVirar && setVirado((v) => !v)}
      style={
        {
          x: arrasto,
          y: flutua,
          rotateX: giroX,
          rotateY: giroY,
          scale: escala,
          transformStyle: "preserve-3d",
          "--gx": brilhoX,
          "--gy": brilhoY,
          touchAction: "pan-y",
        } as never
      }
      className="relative cursor-grab active:cursor-grabbing"
      role={podeVirar ? "button" : undefined}
      tabIndex={podeVirar ? 0 : undefined}
      aria-label={podeVirar ? (virado ? "Ver o aparelho de costas" : "Virar o aparelho e ver a ficha na tela") : undefined}
      onKeyDown={(e) => {
        if (podeVirar && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          setVirado((v) => !v);
        }
      }}
    >
      <motion.div animate={{ rotateY: virado ? 180 : 0 }} transition={MOLA} style={{ transformStyle: "preserve-3d" }} className="relative">
        <div style={face} className="drop-shadow-[0_34px_38px_rgb(0_0_0/0.65)]">
          {frente}
        </div>
        {podeVirar && (
          <div style={{ ...face, transform: "rotateY(180deg)" }} className="absolute inset-0 grid place-items-center">
            <Aparelho forma={forma} cor={cor} lado="frente">
              <TelaFicha item={item} />
            </Aparelho>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Bateria({ valor, parado }: { valor: number; parado: boolean }) {
  const n = useMotionValue(parado ? valor : 0);
  const texto = useTransform(n, (v) => Math.round(v));
  const largura = useTransform(n, (v) => `${v}%`);
  useEffect(() => {
    const controle = animate(n, valor, { duration: parado ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controle.stop();
  }, [n, valor, parado]);
  const baixa = valor < 85;

  return (
    <div className="mt-3 lg:mt-6">
      <p className="flex items-baseline gap-1">
        <motion.span className="font-display text-[44px] font-bold leading-none tracking-[-0.045em] tabular-nums lg:text-[76px]">
          {texto}
        </motion.span>
        <span className="font-display text-[20px] font-semibold lg:text-[30px]">%</span>
        <span className="ml-1 text-[13.5px] text-white/65 lg:text-[16px]">de bateria</span>
      </p>
      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-white/12 lg:h-2.5 lg:max-w-[360px]">
        <motion.div className="h-full rounded-full" style={{ width: largura, background: baixa ? "#ffb45c" : "#f2f3f5" }} />
        {/* cortes que dão o aspecto de medidor */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 calc(10% - 2px), var(--color-noite) calc(10% - 2px) 10%)" }}
        />
      </div>
    </div>
  );
}

export function Palco({
  item,
  dir,
  minutos,
  parado,
  pecaRef,
  onPegar,
  onSoltar,
  onVizinho,
}: {
  item: Item;
  dir: number;
  minutos: number;
  parado: boolean;
  pecaRef: React.RefObject<HTMLDivElement | null>;
  onPegar: () => void;
  onSoltar: () => void;
  onVizinho: (passo: 1 | -1) => void;
}) {
  const cor = corHex(item.cor, item.nome);
  const luz = luzDe(cor);
  const alvoX = useMotionValue(0);
  const alvoY = useMotionValue(0);
  const inclinaX = useSpring(alvoX, { stiffness: 120, damping: 16 });
  const inclinaY = useSpring(alvoY, { stiffness: 120, damping: 16 });
  const area = useRef<HTMLDivElement>(null);

  // No Android o giroscópio inclina a peça. No iPhone isso pede permissão, então fica o arrasto.
  useEffect(() => {
    if (parado || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === "function") return;
    const limite = (v: number) => Math.max(-1, Math.min(1, v));
    const ouvir = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      alvoX.set(limite(e.gamma / 28));
      alvoY.set(limite((e.beta - 45) / 28));
    };
    window.addEventListener("deviceorientation", ouvir);
    return () => window.removeEventListener("deviceorientation", ouvir);
  }, [alvoX, alvoY, parado]);

  const fundo = item.bateria != null ? String(item.bateria) : item.condicao === "lacrado" ? "novo" : "";
  const linha = [item.armazenamento, item.detalhe].filter(Boolean).join(" · ");

  return (
    <div
      ref={area}
      className="relative px-4 pb-4 pt-1 lg:flex lg:h-full lg:flex-col lg:justify-center lg:px-14 lg:pb-10"
      onPointerMove={(e) => {
        if (parado || e.pointerType !== "mouse" || !area.current) return;
        const r = area.current.getBoundingClientRect();
        alvoX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
        alvoY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
      }}
      onPointerLeave={() => {
        alvoX.set(0);
        alvoY.set(0);
      }}
    >
      {/* A luz do palco tem a cor do aparelho */}
      <AnimatePresence initial={false}>
        <motion.div
          key={item.id}
          aria-hidden
          className="pointer-events-none absolute inset-0 -top-20"
          style={{
            background: `radial-gradient(62% 58% at 26% 46%, ${luz}66 0%, ${luz}1f 42%, transparent 72%), radial-gradient(40% 30% at 86% 8%, ${luz}26, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        />
      </AnimatePresence>

      {/* Número gigante de fundo: a bateria desta unidade */}
      <AnimatePresence initial={false} mode="popLayout">
        {fundo && (
          <motion.span
            key={item.id}
            aria-hidden
            className="pointer-events-none absolute -right-[3%] bottom-[14%] select-none font-display text-[52vw] font-bold leading-[0.74] tracking-[-0.07em] lg:bottom-[4%] lg:text-[30vw]"
            style={{ color: `${luz}14` }}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {fundo}
          </motion.span>
        )}
      </AnimatePresence>

      <div className="relative grid grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] items-center gap-3 lg:gap-12">
        {/* A peça */}
        <div className="palco-peca relative grid place-items-center" style={{ perspective: 1100, height: U(108) }}>
          <span aria-hidden className="absolute bottom-0 left-1/2 h-[9%] w-[78%] -translate-x-1/2 rounded-[50%] bg-black/70 blur-xl" />
          <AnimatePresence initial={false} mode="popLayout" custom={dir}>
            <motion.div
              key={item.id}
              ref={pecaRef}
              custom={dir}
              variants={{
                entra: (d: number) => ({ x: d * 150, rotateY: d * 62, opacity: 0, scale: 0.84 }),
                centro: { x: 0, rotateY: 0, opacity: 1, scale: 1 },
                sai: (d: number) => ({ x: d * -150, rotateY: d * -62, opacity: 0, scale: 0.84 }),
              }}
              initial="entra"
              animate="centro"
              exit="sai"
              transition={parado ? { duration: 0 } : MOLA}
              style={{ transformStyle: "preserve-3d" }}
            >
              <PecaViva item={item} inclinaX={inclinaX} inclinaY={inclinaY} parado={parado} onVizinho={onVizinho} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* A ficha */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={item.id}
            className="min-w-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: parado ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.06em] lg:text-[13.5px]">
              {item.condicao && (
                <span className={item.condicao === "lacrado" ? "rounded-md bg-white px-2 py-1 text-noite" : "rounded-md border border-white/30 px-2 py-[3px] text-white/90"}>
                  {NOME_CONDICAO[item.condicao]}
                </span>
              )}
              {item.categoria_nome && <span className="text-white/60">{item.categoria_nome}</span>}
            </p>
            <h1 className="mt-2 text-balance font-display text-[clamp(1.6rem,7.4vw,2.1rem)] font-bold leading-[0.98] tracking-[-0.035em] lg:mt-3 lg:text-[clamp(2.6rem,4.6vw,4.6rem)]">
              {item.nome}
            </h1>
            {linha && <p className="mt-2 text-[15px] text-white/75 lg:mt-3 lg:text-[19px]">{linha}</p>}
            {item.cor && (
              <p className="mt-1.5 flex items-center gap-2 text-[15px] text-white/75 lg:text-[19px]">
                <span aria-hidden className="h-3.5 w-3.5 rounded-full ring-1 ring-white/40" style={{ background: cor }} />
                {item.cor}
              </p>
            )}
            {item.bateria != null && <Bateria valor={item.bateria} parado={parado} />}
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2 font-mono text-[26px] font-semibold tracking-[-0.03em] lg:mt-6 lg:text-[40px]">
              {brl(item.preco)}
              {item.preco_de && <s className="text-[15px] font-medium text-white/55 lg:text-[20px]">{brl(item.preco_de)}</s>}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* A ação */}
      <div className="relative mt-3 flex items-center gap-2 lg:mt-10 lg:max-w-[640px]">
        <button
          type="button"
          onClick={() => onVizinho(-1)}
          aria-label="Aparelho anterior"
          className="grid h-14 w-11 shrink-0 place-items-center rounded-2xl border border-white/15 text-white/80 transition hover:bg-white/8 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          {item.estado === "livre" && (
            <motion.button
              type="button"
              onClick={onPegar}
              whileTap={{ scale: 0.96 }}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ultramar px-4 text-[16.5px] font-semibold text-white shadow-[0_14px_34px_-14px_#2236f0,inset_0_1px_0_rgb(255_255_255/0.25)] transition hover:bg-[#2c40ff]"
            >
              Pegar este
              <span className="hidden text-[14px] font-normal text-white/80 min-[380px]:inline">fica seu por {minutos} min</span>
            </motion.button>
          )}
          {item.estado === "meu" && (
            <div className="flex gap-2">
              <p className="flex h-14 min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-3 text-[15.5px] font-semibold text-noite">
                <Check size={18} strokeWidth={2.6} className="shrink-0 text-ultramar" />
                <span className="truncate">
                  É seu por <Contagem ate={item.ate} className="font-mono tabular-nums" />
                </span>
              </p>
              <button type="button" onClick={onSoltar} className="h-14 shrink-0 rounded-2xl border border-white/25 px-4 text-[15px] font-medium text-white transition hover:bg-white/8">
                Soltar
              </button>
            </div>
          )}
          {item.estado === "pedido" && (
            <p className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 text-[15.5px] font-semibold">
              <Check size={18} strokeWidth={2.6} className="shrink-0 text-ultramar-luz" />
              <span className="truncate">
                {item.ate ? <>No seu pedido · <Contagem ate={item.ate} className="font-mono tabular-nums" /></> : "No seu pedido · aguardando a loja"}
              </span>
            </p>
          )}
          {item.estado === "segurado" && (
            <p className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white/8 px-3 text-[15px] text-white/80">
              <Lock size={16} className="shrink-0" />
              <span className="truncate">
                {item.ate ? <>Segurado · libera em <Contagem ate={item.ate} className="font-mono tabular-nums text-white" /></> : "No pedido de outro revendedor"}
              </span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onVizinho(1)}
          aria-label="Próximo aparelho"
          className="grid h-14 w-11 shrink-0 place-items-center rounded-2xl border border-white/15 text-white/80 transition hover:bg-white/8 hover:text-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <p className="relative mt-2 hidden items-center gap-1.5 text-[13.5px] text-white/55 lg:flex">
        <RotateCw size={14} aria-hidden /> Clique no aparelho para virar. Arraste para o lado para trocar.
      </p>
    </div>
  );
}
