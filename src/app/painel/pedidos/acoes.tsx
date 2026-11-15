"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolverPedido } from "../catalogo-actions";

/** Busca pedidos novos a cada 20 s, sem precisar recarregar a página. */
export function AtualizaSozinho() {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === "visible" && router.refresh(), 20_000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}

export function AcoesPedido({ id }: { id: string }) {
  const router = useRouter();
  const [ocupado, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const agir = (acao: "confirmar" | "cancelar") =>
    iniciar(async () => {
      setErro(null);
      const r = await resolverPedido(id, acao);
      if (r.erro) setErro(r.erro);
      router.refresh();
    });

  return (
    <>
      <button type="button" disabled={ocupado} onClick={() => agir("confirmar")} className="h-11 rounded-campo bg-ultramar px-5 text-[15px] font-semibold text-white disabled:opacity-60">
        Confirmar venda
      </button>
      <button type="button" disabled={ocupado} onClick={() => agir("cancelar")} className="h-11 rounded-campo px-3 text-[14.5px] font-medium text-grafite hover:text-tinta disabled:opacity-60">
        Cancelar e liberar
      </button>
      {erro && (
        <p role="alert" className="w-full rounded-campo bg-alerta-claro px-3.5 py-2.5 text-[14.5px] text-[#a3380a]">
          {erro}
        </p>
      )}
    </>
  );
}
