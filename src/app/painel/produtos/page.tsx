import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { carregarSessao } from "@/lib/loja";
import { ListaProdutos, type Unidade } from "./lista";

export const metadata: Metadata = { title: "Produtos" };

export default async function PaginaProdutos() {
  const sessao = await carregarSessao();
  const loja = sessao.atual!;
  const supabase = await createClient();

  const [{ data: produtos, error }, { data: precos }, { data: categorias }, { data: reservas }] = await Promise.all([
    supabase
      .from("cat_produtos")
      .select("id, nome, categoria_id, armazenamento, detalhe, cor, condicao, bateria, foto_url, status")
      .eq("empresa_id", loja.empresaId)
      .neq("status", "arquivado")
      .order("nome"),
    supabase.from("cat_precos").select("produto_id, preco_vista").eq("empresa_id", loja.empresaId).eq("canal", "revenda"),
    supabase.from("cat_categorias").select("id, nome, ordem").eq("empresa_id", loja.empresaId).order("ordem"),
    supabase.from("cat_reservas").select("produto_id, ate").eq("empresa_id", loja.empresaId).gt("ate", new Date().toISOString()),
  ]);

  const unidades: Unidade[] = (produtos ?? []).map((p) => ({
    ...p,
    preco: precos?.find((x) => x.produto_id === p.id)?.preco_vista ?? null,
    segurado: Boolean(reservas?.some((r) => r.produto_id === p.id)),
  }));

  return (
    <div>
      <h1 className="font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold tracking-[-0.03em]">Produtos</h1>
      <p className="mt-2 max-w-[62ch] text-[16px] text-grafite">
        Cada linha é um aparelho de verdade. O que você mudar aqui aparece na vitrine de revenda em até 10 segundos.
      </p>
      {error ? (
        <p role="alert" className="mt-8 rounded-campo bg-alerta-claro px-4 py-3 text-[15px] text-[#a3380a]">
          Não deu para carregar os produtos. Recarregue a página.
        </p>
      ) : (
        <ListaProdutos unidades={unidades} categorias={categorias ?? []} empresaId={loja.empresaId} mudaPreco={loja.papel !== "editor"} />
      )}
    </div>
  );
}
