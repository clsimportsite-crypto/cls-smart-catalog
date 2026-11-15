"use client";

import { useState, useTransition } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { salvarVitrine } from "../catalogo-actions";

const campoCss = "h-12 w-full rounded-campo border border-linha bg-branco px-3 text-[15.5px] text-tinta disabled:bg-titanio disabled:text-grafite";
const rotulo = "grid gap-1.5 text-[13.5px] font-medium text-grafite";

export function ConfigVitrine({ link, whatsapp, minutos, retiradas, podeMudar }: { link: string; whatsapp: string; minutos: number; retiradas: string; podeMudar: boolean }) {
  const [copiado, setCopiado] = useState(false);
  const [d, setD] = useState({ whatsapp, minutos: String(minutos), retiradas });
  const [msg, setMsg] = useState<{ erro?: boolean; texto: string } | null>(null);
  const [salvando, iniciar] = useTransition();

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      setMsg({ erro: true, texto: "Não deu para copiar. Selecione o link e copie à mão." });
    }
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    iniciar(async () => {
      const r = await salvarVitrine(d);
      setMsg(r.erro ? { erro: true, texto: r.erro } : { texto: "Salvo. Já vale na vitrine." });
    });
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className="rounded-placa bg-tinta p-6 text-white">
        <h2 className="font-display text-[22px] font-semibold tracking-tight">Link para os revendedores</h2>
        <p className="mt-4 break-all rounded-campo bg-white/10 px-3.5 py-3 font-mono text-[14px] leading-relaxed">{link}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={copiar} className="flex h-12 items-center gap-2 rounded-campo bg-ultramar px-5 text-[15.5px] font-semibold">
            {copiado ? <Check size={17} aria-hidden /> : <Copy size={17} aria-hidden />} {copiado ? "Copiado" : "Copiar link"}
          </button>
          <a href={link} target="_blank" rel="noreferrer" className="flex h-12 items-center gap-2 rounded-campo border border-white/25 px-5 text-[15.5px] font-semibold">
            <ExternalLink size={17} aria-hidden /> Abrir a vitrine
          </a>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-white/70">Só abre a vitrine quem recebe este link. O custo dos aparelhos nunca aparece nela.</p>
      </section>

      <form onSubmit={salvar} className="grid content-start gap-4 rounded-placa bg-vidro p-6 ring-1 ring-linha">
        <h2 className="font-display text-[22px] font-semibold tracking-tight">Como a vitrine funciona</h2>
        <label className={rotulo}>
          WhatsApp que recebe o aviso do pedido
          <input value={d.whatsapp} onChange={(e) => setD({ ...d, whatsapp: e.target.value })} inputMode="tel" placeholder="(21) 99999-0000" disabled={!podeMudar} className={campoCss} />
        </label>
        <label className={rotulo}>
          Minutos que o aparelho fica segurado
          <input value={d.minutos} onChange={(e) => setD({ ...d, minutos: e.target.value })} inputMode="numeric" disabled={!podeMudar} className={campoCss} />
        </label>
        <label className={rotulo}>
          Pontos de retirada, separados por vírgula
          <input value={d.retiradas} onChange={(e) => setD({ ...d, retiradas: e.target.value })} placeholder="Caxias, Recreio" disabled={!podeMudar} className={campoCss} />
        </label>
        {msg && (
          <p role={msg.erro ? "alert" : "status"} className={msg.erro ? "rounded-campo bg-alerta-claro px-4 py-3 text-[14.5px] text-[#a3380a]" : "rounded-campo bg-ok-claro px-4 py-3 text-[14.5px] text-[#075c3f]"}>
            {msg.texto}
          </p>
        )}
        {podeMudar ? (
          <button type="submit" disabled={salvando} className="h-12 justify-self-start rounded-campo bg-ultramar px-6 text-[15.5px] font-semibold text-white disabled:opacity-60">
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        ) : (
          <p className="text-[14px] text-grafite">Só o dono e o gerente mudam estas opções.</p>
        )}
      </form>
    </div>
  );
}
