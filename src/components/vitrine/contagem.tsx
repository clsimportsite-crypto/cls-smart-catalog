"use client";

import { useSyncExternalStore } from "react";
import { relogio } from "@/lib/aparelho";

// Um único relógio para a página inteira: todo mundo que mostra contagem escuta o mesmo tique.
const ouvintes = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let agora = Date.now();
let desvio = 0;

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  timer ??= setInterval(() => {
    agora = Date.now();
    ouvintes.forEach((o) => o());
  }, 1000);
  return () => {
    ouvintes.delete(avisar);
    if (!ouvintes.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** A hora do banco pode diferir da do celular; a contagem segue a do banco. */
export function acertarRelogio(horaDoServidor: string) {
  desvio = new Date(horaDoServidor).getTime() - Date.now();
}

export const agoraDoServidor = () => Date.now() + desvio;

/** "14:32" que anda sozinho até zerar. */
export function Contagem({ ate, className }: { ate: string | null; className?: string }) {
  const tique = useSyncExternalStore(assinar, () => agora, () => 0);
  if (!ate || !tique) return null;
  return <span className={className ?? "tabular-nums"}>{relogio(new Date(ate).getTime() - (tique + desvio))}</span>;
}
