import type { Metadata } from "next";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { carregarSessao } from "@/lib/loja";
import { ConfigVitrine } from "./config";

export const metadata: Metadata = { title: "Vitrine" };

export default async function PaginaVitrine() {
  const sessao = await carregarSessao();
  const loja = sessao.atual!;
  const supabase = await createClient();
  const { data } = await supabase
    .from("cat_lojas")
    .select("token_revenda, whatsapp, segura_minutos, retiradas")
    .eq("empresa_id", loja.empresaId)
    .maybeSingle();

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const link = data ? `${host.startsWith("localhost") ? "http" : "https"}://${host}/revenda/${data.token_revenda}` : "";

  return (
    <div>
      <h1 className="font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold tracking-[-0.03em]">Vitrine de revenda</h1>
      <p className="mt-2 max-w-[62ch] text-[16px] text-grafite">
        Em vez de mandar a lista, mande este link. Quem tem o link vê os aparelhos, pega os que quer e o pedido chega em Pedidos.
      </p>
      {data ? (
        <ConfigVitrine link={link} whatsapp={data.whatsapp ?? ""} minutos={data.segura_minutos} retiradas={data.retiradas.join(", ")} podeMudar={loja.papel !== "editor"} />
      ) : (
        <p role="alert" className="mt-8 rounded-campo bg-alerta-claro px-4 py-3 text-[15px] text-[#a3380a]">
          Não deu para carregar a vitrine. Recarregue a página.
        </p>
      )}
    </div>
  );
}
