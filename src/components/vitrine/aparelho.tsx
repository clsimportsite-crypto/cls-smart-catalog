import type { CSSProperties, ReactNode } from "react";
import { clsx } from "clsx";
import { ehEscura, misturar, type Forma } from "@/lib/aparelho";

/**
 * O aparelho desenhado em CSS, na cor da unidade e com a câmera da geração certa.
 * Todas as medidas são em "u" (1u = 1% da altura), então o mesmo desenho serve
 * de miniatura no elenco e de peça grande no palco: quem usa define --u.
 */
const U = (n: number) => `calc(var(--u) * ${n})`;

type Plato = [x: number, y: number, l: number, a: number, raio: number];
type Ponto = [x: number, y: number, diametro: number];

const FORMAS: Record<Forma, { l: number; r: number; plato?: Plato; lentes: Ponto[]; flash?: Ponto }> = {
  duoV: { l: 48.5, r: 8.5, plato: [4, 3.5, 21, 21, 6], lentes: [[6.4, 5.4, 8], [6.4, 14.6, 8]], flash: [17.8, 7, 3] },
  duoD: { l: 48.5, r: 8.5, plato: [4, 3.5, 22, 22, 6.5], lentes: [[6, 5.4, 8.6], [15.4, 14.9, 8.6]], flash: [18.4, 6.6, 3] },
  pilula: { l: 48.5, r: 8.5, plato: [5, 4, 12, 24.4, 6], lentes: [[7, 6, 8], [7, 18.2, 8]], flash: [20.5, 8.5, 3] },
  solo: { l: 48.5, r: 8.5, lentes: [[6, 5.5, 10]], flash: [19.5, 8.8, 3] },
  tri: { l: 49.5, r: 8.8, plato: [3.8, 3.3, 26, 26, 7.6], lentes: [[6, 5.4, 9.4], [6, 17.6, 9.4], [18, 11.5, 9.4]], flash: [20.6, 5.6, 3] },
  barra: { l: 49.5, r: 8.8, plato: [3.3, 3.1, 42.9, 25.6, 7.6], lentes: [[6, 5.2, 9.4], [6, 17.2, 9.4], [18, 11.2, 9.4]], flash: [38.6, 7, 3.2] },
  triV: { l: 48.5, r: 7.5, lentes: [[6, 5, 8], [6, 16, 8], [6, 27, 8]], flash: [17.5, 7.5, 3] },
  tablet: { l: 72, r: 5.5, lentes: [[5, 4.6, 4.6]] },
  tabletIlha: { l: 72, r: 5.5, plato: [4, 3.6, 9.4, 17.4, 4.2], lentes: [[6, 5.2, 5.4], [6, 12.8, 5.4]] },
  relogio: { l: 60, r: 15, lentes: [] },
  mouse: { l: 58, r: 28, lentes: [] },
  caixa: { l: 76, r: 9, lentes: [] },
};

/** Largura do desenho em "u". Útil para reservar espaço antes de desenhar. */
export const larguraDe = (forma: Forma) => FORMAS[forma].l;

const BRILHO: CSSProperties = {
  background: "radial-gradient(circle at var(--gx, 28%) var(--gy, 16%), rgb(255 255 255 / 0.36), transparent 48%)",
  mixBlendMode: "soft-light",
};

export function Aparelho({
  forma,
  cor,
  lado = "tras",
  altura,
  className,
  children,
}: {
  forma: Forma;
  cor: string;
  lado?: "tras" | "frente";
  /** Altura em px. Sem ela, o desenho usa o --u definido por quem o envolve. */
  altura?: number;
  className?: string;
  /** O que aparece na tela quando o aparelho está de frente. */
  children?: ReactNode;
}) {
  const f = FORMAS[forma];
  const escura = ehEscura(cor);
  const claro = misturar(cor, "#ffffff", escura ? 0.2 : 0.4);
  const sombra = misturar(cor, "#000000", escura ? 0.35 : 0.2);
  const aro = misturar(cor, escura ? "#ffffff" : "#000000", escura ? 0.22 : 0.16);
  const base: CSSProperties = {
    width: U(f.l),
    height: U(100),
    ...(altura ? ({ "--u": `${altura / 100}px` } as CSSProperties) : null),
  };
  const corpo: CSSProperties = {
    borderRadius: U(f.r),
    background: `linear-gradient(150deg, ${claro}, ${cor} 42%, ${sombra})`,
    boxShadow: `inset 0 0 0 ${U(0.8)} ${aro}, inset 0 ${U(0.7)} ${U(1.4)} rgb(255 255 255 / 0.3), inset 0 ${U(-1.2)} ${U(2.6)} rgb(0 0 0 / 0.3)`,
  };

  if (forma === "relogio") {
    const pulseira = misturar(cor, "#000000", escura ? 0.3 : 0.14);
    return (
      <div aria-hidden className={clsx("relative shrink-0", className)} style={base}>
        <span className="absolute" style={{ left: U(11), top: 0, width: U(38), height: U(30), borderRadius: `${U(7)} ${U(7)} 0 0`, background: `linear-gradient(180deg, ${sombra}, ${pulseira})` }} />
        <span className="absolute" style={{ left: U(11), bottom: 0, width: U(38), height: U(30), borderRadius: `0 0 ${U(7)} ${U(7)}`, background: `linear-gradient(0deg, ${sombra}, ${pulseira})` }} />
        <span className="absolute" style={{ left: U(56.6), top: U(35), width: U(3.4), height: U(9), borderRadius: U(1.5), background: aro }} />
        <span className="absolute" style={{ left: U(56.6), top: U(49), width: U(2.2), height: U(11), borderRadius: U(1), background: aro }} />
        <div className="absolute" style={{ ...corpo, left: U(3), top: U(20), width: U(54), height: U(60), padding: U(2.8) }}>
          <div className="relative h-full w-full overflow-hidden bg-black" style={{ borderRadius: U(12.4) }}>
            {children ?? (
              <svg viewBox="0 0 40 46" className="absolute inset-0 h-full w-full" fill="none" strokeLinecap="round">
                <circle cx="20" cy="23" r="13" stroke="rgb(255 255 255 / 0.12)" strokeWidth="3.4" />
                <path d="M20 10a13 13 0 1 1-11.3 6.5" stroke="#98a2ff" strokeWidth="3.4" />
                <circle cx="20" cy="23" r="7.6" stroke="rgb(255 255 255 / 0.12)" strokeWidth="3.4" />
                <path d="M20 15.4a7.6 7.6 0 0 1 6.6 11.4" stroke="#f2f3f5" strokeWidth="3.4" />
              </svg>
            )}
            <span className="absolute inset-0" style={BRILHO} />
          </div>
        </div>
      </div>
    );
  }

  if (forma === "mouse" || forma === "caixa") {
    const mouse = forma === "mouse";
    return (
      <div aria-hidden className={clsx("relative shrink-0", className)} style={base}>
        <div
          className="absolute inset-x-0 overflow-hidden"
          style={{
            ...corpo,
            top: mouse ? 0 : U(12),
            height: mouse ? U(100) : U(76),
            borderRadius: mouse ? "48% 48% 46% 46% / 30% 30% 34% 34%" : U(f.r),
            background: `linear-gradient(160deg, ${misturar(cor, "#ffffff", 0.7)}, ${cor} 52%, ${sombra})`,
          }}
        >
          {!mouse && <span className="absolute" style={{ left: "50%", top: "50%", width: U(22), height: U(22), transform: "translate(-50%,-50%)", borderRadius: "50%", boxShadow: `inset 0 0 0 ${U(1.6)} ${aro}` }} />}
          <span className="absolute inset-0" style={BRILHO} />
        </div>
      </div>
    );
  }

  if (lado === "frente") {
    const tablet = forma === "tablet" || forma === "tabletIlha";
    return (
      <div aria-hidden className={clsx("relative shrink-0", className)} style={base}>
        <div className="absolute inset-0" style={{ ...corpo, padding: U(tablet ? 2.6 : 1.5) }}>
          <div className="relative h-full w-full overflow-hidden bg-black" style={{ borderRadius: U(f.r - (tablet ? 2.2 : 1.5)) }}>
            {!tablet && (
              <span className="absolute z-10" style={{ left: "50%", top: U(2.3), width: U(13.5), height: U(3.7), transform: "translateX(-50%)", borderRadius: U(2), background: "#000", boxShadow: "0 0 0 1px rgb(255 255 255 / 0.07)" }} />
            )}
            {children}
            <span className="pointer-events-none absolute inset-0" style={BRILHO} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden className={clsx("relative shrink-0", className)} style={base}>
      {/* botões da lateral */}
      <span className="absolute" style={{ left: U(-0.7), top: U(20), width: U(1.3), height: U(6), borderRadius: U(0.6), background: aro }} />
      <span className="absolute" style={{ left: U(-0.7), top: U(29), width: U(1.3), height: U(9), borderRadius: U(0.6), background: aro }} />
      <span className="absolute" style={{ right: U(-0.7), top: U(27), width: U(1.3), height: U(13), borderRadius: U(0.6), background: aro }} />
      <div className="absolute inset-0 overflow-hidden" style={corpo}>
        <span className="absolute inset-0" style={BRILHO} />
        {f.plato && (
          <span
            className="absolute"
            style={{
              left: U(f.plato[0]),
              top: U(f.plato[1]),
              width: U(f.plato[2]),
              height: U(f.plato[3]),
              borderRadius: U(f.plato[4]),
              background: `linear-gradient(150deg, ${misturar(cor, "#ffffff", escura ? 0.14 : 0.3)}, ${misturar(cor, "#000000", escura ? 0.12 : 0.08)})`,
              boxShadow: `inset 0 0 0 ${U(0.35)} ${aro}, 0 ${U(0.5)} ${U(1.6)} rgb(0 0 0 / 0.28)`,
            }}
          />
        )}
        {f.lentes.map(([x, y, d], i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: U(x),
              top: U(y),
              width: U(d),
              height: U(d),
              background: "radial-gradient(circle at 34% 30%, #4a5670 0%, #10131c 38%, #000 72%)",
              boxShadow: `0 0 0 ${U(0.9)} ${misturar(cor, "#000000", escura ? 0.45 : 0.3)}, 0 0 0 ${U(1.3)} ${aro}`,
            }}
          />
        ))}
        {f.flash && (
          <span
            className="absolute rounded-full"
            style={{ left: U(f.flash[0]), top: U(f.flash[1]), width: U(f.flash[2]), height: U(f.flash[2]), background: "radial-gradient(circle, #fffbe8, #e9dcae)", boxShadow: `0 0 0 ${U(0.3)} ${aro}` }}
          />
        )}
      </div>
    </div>
  );
}
