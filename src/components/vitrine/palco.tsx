"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTime,
  useTransform,
  type MotionValue,
} from "motion/react";
import { corHex, formaDe, NOME_CONDICAO, type Forma, type Item } from "@/lib/aparelho";
import { Aparelho } from "./aparelho";

const U = (n: number) => `calc(var(--u) * ${n})`;
export const MOLA = { type: "spring", stiffness: 260, damping: 26 } as const;
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
export function PecaViva({
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

export function Bateria({ valor, parado }: { valor: number; parado: boolean }) {
  const n = useMotionValue(parado ? valor : 0);
  const texto = useTransform(n, (v) => Math.round(v));
  const largura = useTransform(n, (v) => `${v}%`);
  useEffect(() => {
    const controle = animate(n, valor, { duration: parado ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controle.stop();
  }, [n, valor, parado]);
  const baixa = valor < 85;

  return (
    <div>
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

/** Inclinação da peça: segue o mouse no computador e o giroscópio no Android. No iPhone fica o arrasto. */
export function useInclinacao(parado: boolean) {
  const alvoX = useMotionValue(0);
  const alvoY = useMotionValue(0);
  const inclinaX = useSpring(alvoX, { stiffness: 120, damping: 16 });
  const inclinaY = useSpring(alvoY, { stiffness: 120, damping: 16 });

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

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (parado || e.pointerType !== "mouse") return;
      const r = e.currentTarget.getBoundingClientRect();
      alvoX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      alvoY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    },
    [alvoX, alvoY, parado],
  );
  const onPointerLeave = useCallback(() => {
    alvoX.set(0);
    alvoY.set(0);
  }, [alvoX, alvoY]);

  return { inclinaX, inclinaY, onPointerMove, onPointerLeave };
}
