import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/server";
import { carregarSessao, NOME_PAPEL } from "@/lib/loja";

export const metadata: Metadata = { title: "Início" };

function saudacao() {
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hourCycle: "h23", timeZone: "America/Sao_Paulo" }).format(new Date()),
  );
  if (hora < 5) return "Boa madrugada";
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

// Situação real de cada fase do projeto. Atualizada a cada entrega.
const FASES = [
  { n: 0, nome: "Fundação", estado: "pronta" },
  { n: 1, nome: "Importação inteligente", estado: "construindo" },
  { n: 2, nome: "Produtos e preços", estado: "construindo" },
  { n: 3, nome: "Fotos certas", estado: "depois" },
  { n: 4, nome: "Vitrine e WhatsApp", estado: "construindo" },
  { n: 5, nome: "Painel de números", estado: "depois" },
  { n: 6, nome: "Outras lojas", estado: "depois" },
] as const;

export default async function PaginaInicio() {
  const sessao = await carregarSessao();
  const loja = sessao.atual!;
  const supabase = await createClient();
  const eid = loja.empresaId;

  const contar = (status?: string) => {
    let q = supabase.from("cat_produtos").select("id", { count: "exact", head: true }).eq("empresa_id", eid);
    if (status) q = q.eq("status", status);
    return q;
  };

  const [todos, ativos, vendidos, pedidosNovos, importacoes] = await Promise.all([
    contar(),
    contar("ativo"),
    contar("vendido"),
    supabase.from("cat_pedidos").select("id", { count: "exact", head: true }).eq("empresa_id", eid).eq("status", "novo"),
    supabase.from("cat_importacoes").select("id", { count: "exact", head: true }).eq("empresa_id", eid),
  ]);

  const numeros = [
    { rotulo: "Pedidos esperando", valor: pedidosNovos.count ?? 0, atencao: (pedidosNovos.count ?? 0) > 0 },
    { rotulo: "Na vitrine agora", valor: ativos.count ?? 0 },
    { rotulo: "Vendidos", valor: vendidos.count ?? 0 },
    { rotulo: "Aparelhos no catálogo", valor: todos.count ?? 0 },
    { rotulo: "Listas importadas", valor: importacoes.count ?? 0 },
  ];

  return (
    <div>
      <p className="text-[15px] text-grafite">
        {loja.nome}, acesso de {NOME_PAPEL[loja.papel].toLowerCase()}
      </p>
      <h1 className="mt-1 font-display text-[clamp(2rem,4.4vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
        {saudacao()}, {sessao.nome.split(" ")[0]}.
      </h1>

      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-linha py-8 sm:grid-cols-3 lg:grid-cols-5">
        {numeros.map((n) => (
          <div key={n.rotulo}>
            <dt className="text-[14px] text-grafite">{n.rotulo}</dt>
            <dd
              className={clsx(
                "mt-1 font-display text-[40px] font-semibold leading-none tracking-[-0.03em] tabular-nums",
                n.atencao ? "text-alerta" : "text-tinta",
              )}
            >
              {n.valor}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-placa bg-tinta p-7 text-white">
          <h2 className="font-display text-[24px] font-semibold tracking-tight">A vitrine de revenda está no ar.</h2>
          <p className="mt-3 max-w-[36ch] text-[15.5px] leading-relaxed text-white/70">
            Mande o link para os revendedores em vez da lista. O que eles fecham chega em Pedidos, pronto para você confirmar.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/painel/vitrine" className="flex h-11 items-center rounded-campo bg-ultramar px-4 text-[15px] font-semibold">
              Pegar o link
            </Link>
            <Link href="/painel/pedidos" className="flex h-11 items-center rounded-campo border border-white/25 px-4 text-[15px] font-semibold">
              Ver pedidos
            </Link>
          </div>
        </div>

        <div>
          <h2 className="font-display text-[20px] font-semibold tracking-tight">Andamento do projeto</h2>
          <ol className="mt-4">
            {FASES.map((f) => (
              <li key={f.n} className="flex items-center gap-4 border-b border-linha/80 py-3 last:border-0">
                <span
                  aria-hidden
                  className={clsx(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold tabular-nums",
                    f.estado === "pronta" && "bg-ok text-white",
                    f.estado === "construindo" && "bg-ultramar text-white",
                    f.estado === "depois" && "border border-linha text-nevoa",
                  )}
                >
                  {f.n}
                </span>
                <span className={clsx("flex-1 text-[15.5px]", f.estado === "depois" ? "text-grafite" : "font-medium")}>
                  {f.nome}
                </span>
                <span
                  className={clsx(
                    "text-[13.5px]",
                    f.estado === "pronta" && "text-ok",
                    f.estado === "construindo" && "text-ultramar",
                    f.estado === "depois" && "text-nevoa",
                  )}
                >
                  {f.estado === "pronta" ? "Pronta" : f.estado === "construindo" ? "Em construção" : "Na fila"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
