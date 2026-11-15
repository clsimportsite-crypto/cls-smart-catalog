"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function apitar() {
  try {
    const ctx = new AudioContext();
    [880, 1175].forEach((nota, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = nota;
      g.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.3);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 0.32);
    });
  } catch {
    // navegador sem som liberado: o aviso visual continua
  }
}

/**
 * Com o painel aberto em qualquer tela, confere a cada 20 s se chegou pedido.
 * Chegou: apita, muda o título da aba, mostra uma faixa e, se permitido, uma notificação do navegador.
 */
export function AvisoPedidos({ empresaId }: { empresaId: string }) {
  const router = useRouter();
  const [novos, setNovos] = useState(0);
  const [faixa, setFaixa] = useState(false);
  const anterior = useRef<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const titulo = document.title;
    const conferir = async () => {
      const { count } = await supabase.from("cat_pedidos").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId).eq("status", "novo");
      if (count == null) return;
      setNovos(count);
      document.title = count > 0 ? `(${count}) Pedido novo · CLS` : titulo;
      if (anterior.current != null && count > anterior.current) {
        apitar();
        setFaixa(true);
        router.refresh();
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("Pedido novo na vitrine", { body: "Um revendedor fechou um pedido. Abra Pedidos para confirmar." });
        }
      }
      anterior.current = count;
    };
    conferir();
    const t = setInterval(conferir, 20_000);
    return () => {
      clearInterval(t);
      document.title = titulo;
    };
  }, [empresaId, router]);

  if (!faixa || novos === 0) return null;
  return (
    <div role="status" className="fixed inset-x-3 top-3 z-50 mx-auto flex max-w-lg items-center gap-3 rounded-2xl bg-tinta p-2 pl-4 text-white shadow-2xl">
      <p className="min-w-0 flex-1 text-[15px] font-medium">
        {novos === 1 ? "Chegou 1 pedido novo." : `Há ${novos} pedidos esperando.`}
      </p>
      <Link href="/painel/pedidos" onClick={() => setFaixa(false)} className="flex h-11 shrink-0 items-center rounded-xl bg-ultramar px-4 text-[15px] font-semibold">
        Ver pedidos
      </Link>
    </div>
  );
}
