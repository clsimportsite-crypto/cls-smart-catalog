import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { carregarSessao, NOME_PAPEL, type Papel } from "@/lib/loja";

export const metadata: Metadata = { title: "Equipe" };

const O_QUE_FAZ: Record<Papel, string> = {
  dono: "Tudo, inclusive custos, preços e convidar pessoas",
  gerente: "Importa listas, vê custos e define preços",
  editor: "Cuida de produtos e fotos, sem ver custos",
};

export default async function PaginaEquipe() {
  const sessao = await carregarSessao();
  const loja = sessao.atual!;
  const supabase = await createClient();

  const { data: membros, error } = await supabase
    .from("cat_membros")
    .select("user_id, papel, ativo")
    .eq("empresa_id", loja.empresaId)
    .order("papel");

  const ids = (membros ?? []).map((m) => m.user_id);
  let pessoas: { id: string; nome: string | null; email: string | null }[] = [];
  if (ids.length) {
    const r = await supabase.from("usuarios").select("id, nome, email").in("id", ids);
    pessoas = r.data ?? [];
  }

  const ordem: Papel[] = ["dono", "gerente", "editor"];
  const lista = (membros ?? [])
    .map((m) => {
      const p = pessoas.find((x) => x.id === m.user_id);
      return { ...m, papel: m.papel as Papel, nome: p?.nome || p?.email || "Pessoa sem nome", email: p?.email ?? "" };
    })
    .sort((a, b) => ordem.indexOf(a.papel) - ordem.indexOf(b.papel));

  return (
    <div>
      <h1 className="font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold tracking-[-0.03em]">Equipe</h1>
      <p className="mt-2 max-w-[60ch] text-[16px] text-grafite">
        Quem trabalha na {loja.nome} e o que cada um pode fazer. Convites chegam na fase 6.
      </p>

      {error ? (
        <p role="alert" className="mt-8 rounded-campo bg-alerta-claro px-4 py-3 text-[15px] text-[#a3380a]">
          Não deu para carregar a equipe. Recarregue a página; se continuar, me avise.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-linha/80 border-y border-linha">
          {lista.map((m) => (
            <li key={m.user_id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tinta font-display text-[15px] font-semibold uppercase text-white">
                {m.nome.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-medium">
                  {m.nome}
                  {m.user_id === sessao.userId && <span className="font-normal text-grafite"> (você)</span>}
                </span>
                <span className="block truncate text-[14px] text-grafite">{m.email}</span>
              </span>
              <span className="w-full pl-14 text-[14px] text-grafite sm:w-auto sm:pl-0 sm:text-right">
                <span className="font-semibold text-tinta">{NOME_PAPEL[m.papel]}</span>
                <span className="block">{O_QUE_FAZ[m.papel]}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
