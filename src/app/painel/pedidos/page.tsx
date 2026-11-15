import type { Metadata } from "next";
import { clsx } from "clsx";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { carregarSessao } from "@/lib/loja";
import { brl, NOME_PAGAMENTO, whatsappLink } from "@/lib/aparelho";
import { AcoesPedido, AtualizaSozinho } from "./acoes";

export const metadata: Metadata = { title: "Pedidos" };

const ESTADO: Record<string, { nome: string; cor: string }> = {
  novo: { nome: "Novo", cor: "bg-alerta-claro text-[#a3380a]" },
  confirmado: { nome: "Confirmado", cor: "bg-ok-claro text-[#075c3f]" },
  cancelado: { nome: "Cancelado", cor: "bg-titanio text-grafite" },
};
const quando = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export default async function PaginaPedidos() {
  const sessao = await carregarSessao();
  const loja = sessao.atual!;
  const supabase = await createClient();

  const { data: pedidos, error } = await supabase
    .from("cat_pedidos")
    .select("id, numero, comprador_nome, comprador_whatsapp, pagamento, entrega, observacao, total, status, created_at")
    .eq("empresa_id", loja.empresaId)
    .order("created_at", { ascending: false })
    .limit(60);
  const ids = (pedidos ?? []).map((p) => p.id);
  const { data: itens } = ids.length
    ? await supabase.from("cat_pedido_itens").select("id, pedido_id, descricao, preco").in("pedido_id", ids)
    : { data: [] };
  const novos = (pedidos ?? []).filter((p) => p.status === "novo").length;

  return (
    <div>
      <AtualizaSozinho />
      <h1 className="font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold tracking-[-0.03em]">Pedidos</h1>
      <p className="mt-2 max-w-[62ch] text-[16px] text-grafite">
        {novos > 0
          ? `${novos} ${novos === 1 ? "pedido esperando" : "pedidos esperando"} você. Confirmar tira os aparelhos da vitrine.`
          : "O que os revendedores fecham na vitrine chega aqui pronto. Esta tela se atualiza sozinha."}
      </p>

      {error ? (
        <p role="alert" className="mt-8 rounded-campo bg-alerta-claro px-4 py-3 text-[15px] text-[#a3380a]">
          Não deu para carregar os pedidos. Recarregue a página.
        </p>
      ) : !pedidos?.length ? (
        <p className="mt-8 rounded-placa bg-vidro px-5 py-10 text-center text-[15.5px] text-grafite">Nenhum pedido ainda. Envie o link da vitrine para um revendedor.</p>
      ) : (
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          {pedidos.map((p) => {
            const e = ESTADO[p.status] ?? ESTADO.novo;
            const linhas = (itens ?? []).filter((i) => i.pedido_id === p.id);
            return (
              <li key={p.id} className={clsx("rounded-placa bg-branco p-5 ring-1", p.status === "novo" ? "ring-2 ring-ultramar" : "ring-linha")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] text-grafite">
                      Pedido nº {p.numero} · {quando.format(new Date(p.created_at))}
                    </p>
                    <h2 className="mt-0.5 truncate font-display text-[24px] font-semibold tracking-tight">{p.comprador_nome}</h2>
                  </div>
                  <span className={clsx("shrink-0 rounded-full px-2.5 py-1 text-[13px] font-semibold", e.cor)}>{e.nome}</span>
                </div>

                <ul className="mt-3 border-y border-linha/80">
                  {linhas.map((i) => (
                    <li key={i.id} className="flex items-baseline justify-between gap-3 border-b border-linha/60 py-2 last:border-0">
                      <span className="text-[15px]">{i.descricao}</span>
                      <span className="shrink-0 font-mono text-[14.5px] font-semibold tabular-nums">{brl(i.preco)}</span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-3 grid grid-cols-[92px_1fr] gap-x-3 gap-y-1 text-[14.5px]">
                  <dt className="text-grafite">Pagamento</dt>
                  <dd className="font-medium">{NOME_PAGAMENTO[p.pagamento] ?? p.pagamento}</dd>
                  <dt className="text-grafite">Recebe</dt>
                  <dd className="font-medium">{p.entrega === "Entrega" ? "Entrega" : `Retirada em ${p.entrega}`}</dd>
                  {p.observacao && (
                    <>
                      <dt className="text-grafite">Recado</dt>
                      <dd>{p.observacao}</dd>
                    </>
                  )}
                </dl>
                <p className="mt-3 flex items-baseline justify-between">
                  <span className="text-[14.5px] text-grafite">Total</span>
                  <span className="font-mono text-[26px] font-semibold tracking-[-0.02em]">{brl(p.total)}</span>
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.status === "novo" && <AcoesPedido id={p.id} />}
                  <a
                    href={whatsappLink(p.comprador_whatsapp, `Olá, ${p.comprador_nome}! Recebi seu pedido nº ${p.numero} na ${loja.nome}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 items-center gap-2 rounded-campo border border-linha bg-branco px-4 text-[14.5px] font-medium"
                  >
                    <MessageCircle size={16} aria-hidden /> Chamar no WhatsApp
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
