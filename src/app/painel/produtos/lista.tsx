"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Camera, Lock, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { brl, corHex, formaDe, NOME_CONDICAO, resumo } from "@/lib/aparelho";
import { Aparelho } from "@/components/vitrine/aparelho";
import { definirFoto, salvarProduto, type DadosProduto } from "../catalogo-actions";

export type Unidade = {
  id: string;
  nome: string;
  categoria_id: string | null;
  armazenamento: string | null;
  detalhe: string | null;
  cor: string | null;
  condicao: string | null;
  bateria: number | null;
  foto_url: string | null;
  status: string;
  preco: number | null;
  segurado: boolean;
};
type Categoria = { id: string; nome: string };

const SITUACAO: Record<string, { nome: string; cor: string }> = {
  ativo: { nome: "Na vitrine", cor: "bg-ok-claro text-[#075c3f]" },
  indisponivel: { nome: "Fora da vitrine", cor: "bg-titanio text-grafite" },
  revisao: { nome: "Em revisão", cor: "bg-alerta-claro text-[#a3380a]" },
  vendido: { nome: "Vendido", cor: "bg-tinta text-white" },
};
const campoCss = "h-12 w-full rounded-campo border border-linha bg-branco px-3 text-[15.5px] text-tinta disabled:bg-titanio disabled:text-grafite";

/** Reduz a foto no próprio navegador antes de enviar, para a vitrine abrir rápido no celular. */
async function reduzir(arquivo: File): Promise<Blob> {
  const img = await createImageBitmap(arquivo);
  const k = Math.min(1, 1400 / Math.max(img.width, img.height));
  const tela = document.createElement("canvas");
  tela.width = Math.round(img.width * k);
  tela.height = Math.round(img.height * k);
  tela.getContext("2d")!.drawImage(img, 0, 0, tela.width, tela.height);
  return new Promise((ok, falha) => tela.toBlob((b) => (b ? ok(b) : falha(new Error("foto"))), "image/jpeg", 0.86));
}

function Formulario({
  unidade,
  categorias,
  empresaId,
  mudaPreco,
  onFim,
}: {
  unidade: Unidade | null;
  categorias: Categoria[];
  empresaId: string;
  mudaPreco: boolean;
  onFim: () => void;
}) {
  const router = useRouter();
  const [d, setD] = useState<DadosProduto>({
    id: unidade?.id,
    nome: unidade?.nome ?? "",
    categoria_id: unidade?.categoria_id ?? categorias[0]?.id ?? null,
    armazenamento: unidade?.armazenamento ?? "",
    detalhe: unidade?.detalhe ?? "",
    cor: unidade?.cor ?? "",
    condicao: unidade?.condicao ?? "",
    bateria: unidade?.bateria?.toString() ?? "",
    preco: unidade?.preco?.toString() ?? "",
    status: unidade?.status === "revisao" ? "indisponivel" : (unidade?.status ?? "ativo"),
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const arquivo = useRef<HTMLInputElement>(null);
  const campo = (k: keyof DadosProduto) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setD((x) => ({ ...x, [k]: e.target.value }));

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      const r = await salvarProduto(d);
      if (r.erro) return setErro(r.erro);
      router.refresh();
      onFim();
    });
  }

  async function trocarFoto(f: File | undefined) {
    if (!f || !unidade) return;
    setErro(null);
    setEnviandoFoto(true);
    try {
      const caminho = `${empresaId}/${unidade.id}-${Date.now()}.jpg`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("cat-fotos").upload(caminho, await reduzir(f), { contentType: "image/jpeg" });
      if (error) throw error;
      const r = await definirFoto(unidade.id, supabase.storage.from("cat-fotos").getPublicUrl(caminho).data.publicUrl);
      if (r.erro) throw new Error(r.erro);
      router.refresh();
    } catch {
      setErro("Não deu para enviar a foto. Tente com outra imagem.");
    } finally {
      setEnviandoFoto(false);
    }
  }

  function tirarFoto() {
    if (!unidade) return;
    iniciar(async () => {
      const r = await definirFoto(unidade.id, null);
      if (r.erro) return setErro(r.erro);
      router.refresh();
    });
  }

  const rotulo = "grid gap-1.5 text-[13.5px] font-medium text-grafite";
  return (
    <form onSubmit={salvar} className="grid gap-4 rounded-placa bg-vidro p-5 ring-1 ring-linha sm:grid-cols-2 lg:grid-cols-4">
      <label className={clsx(rotulo, "sm:col-span-2")}>
        Aparelho
        <input value={d.nome} onChange={campo("nome")} placeholder="iPhone 16 Pro Max" className={campoCss} required />
      </label>
      <label className={rotulo}>
        Categoria
        <select value={d.categoria_id ?? ""} onChange={campo("categoria_id")} className={campoCss}>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </label>
      <label className={rotulo}>
        Preço de revenda (R$)
        <input value={d.preco} onChange={campo("preco")} inputMode="decimal" placeholder="4900" disabled={!mudaPreco} className={clsx(campoCss, "font-mono")} />
      </label>
      <label className={rotulo}>
        Memória
        <input value={d.armazenamento} onChange={campo("armazenamento")} placeholder="256 GB" className={campoCss} />
      </label>
      <label className={rotulo}>
        Cor
        <input value={d.cor} onChange={campo("cor")} placeholder="Branco" className={campoCss} />
      </label>
      <label className={rotulo}>
        Condição
        <select value={d.condicao} onChange={campo("condicao")} className={campoCss}>
          <option value="">Não informada</option>
          {Object.entries(NOME_CONDICAO).map(([v, n]) => (
            <option key={v} value={v}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className={rotulo}>
        Bateria (%)
        <input value={d.bateria} onChange={campo("bateria")} inputMode="numeric" placeholder="93" className={campoCss} />
      </label>
      <label className={clsx(rotulo, "sm:col-span-2")}>
        Outro detalhe
        <input value={d.detalhe} onChange={campo("detalhe")} placeholder="44 mm · 2ª geração" className={campoCss} />
      </label>
      <label className={clsx(rotulo, "sm:col-span-2")}>
        Situação
        <select value={d.status} onChange={campo("status")} className={campoCss}>
          <option value="ativo">Na vitrine</option>
          <option value="indisponivel">Fora da vitrine</option>
          <option value="vendido">Vendido</option>
          {unidade && <option value="arquivado">Apagar da lista</option>}
        </select>
      </label>

      {unidade && (
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
          {unidade.foto_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={unidade.foto_url} alt="Foto atual" className="h-16 w-12 rounded-lg object-cover ring-1 ring-linha" />
          )}
          <input ref={arquivo} type="file" accept="image/*" className="sr-only" onChange={(e) => trocarFoto(e.target.files?.[0])} aria-label="Foto real do aparelho" />
          <button type="button" onClick={() => arquivo.current?.click()} disabled={enviandoFoto} className="flex h-11 items-center gap-2 rounded-campo border border-linha bg-branco px-4 text-[14.5px] font-medium">
            <Camera size={16} aria-hidden /> {enviandoFoto ? "Enviando…" : unidade.foto_url ? "Trocar a foto" : "Pôr foto real"}
          </button>
          {unidade.foto_url && (
            <button type="button" onClick={tirarFoto} className="flex h-11 items-center gap-2 rounded-campo px-3 text-[14.5px] text-grafite hover:text-tinta">
              <Trash2 size={15} aria-hidden /> Voltar ao desenho
            </button>
          )}
          <span className="text-[13.5px] text-grafite">Sem foto, a vitrine mostra o desenho na cor do aparelho.</span>
        </div>
      )}

      {erro && (
        <p role="alert" className="rounded-campo bg-alerta-claro px-4 py-3 text-[14.5px] text-[#a3380a] sm:col-span-2 lg:col-span-4">
          {erro}
        </p>
      )}
      <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
        <button type="submit" disabled={salvando} className="h-12 rounded-campo bg-ultramar px-6 text-[15.5px] font-semibold text-white disabled:opacity-60">
          {salvando ? "Salvando…" : unidade ? "Salvar" : "Adicionar"}
        </button>
        <button type="button" onClick={onFim} className="h-12 rounded-campo px-4 text-[15px] font-medium text-grafite hover:text-tinta">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function ListaProdutos({ unidades, categorias, empresaId, mudaPreco }: { unidades: Unidade[]; categorias: Categoria[]; empresaId: string; mudaPreco: boolean }) {
  const [aberto, setAberto] = useState<string | null>(null); // id em edição, ou "novo"
  const ordenadas = [...unidades].sort(
    (a, b) =>
      categorias.findIndex((c) => c.id === a.categoria_id) - categorias.findIndex((c) => c.id === b.categoria_id) ||
      (a.preco ?? 0) - (b.preco ?? 0) ||
      a.nome.localeCompare(b.nome),
  );
  const naVitrine = unidades.filter((u) => u.status === "ativo" && u.preco != null).length;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-grafite">
          <span className="font-semibold text-tinta">{naVitrine}</span> na vitrine, de {unidades.length} aparelhos
        </p>
        <button type="button" onClick={() => setAberto("novo")} className="flex h-11 items-center gap-2 rounded-campo bg-tinta px-4 text-[15px] font-semibold text-white">
          <Plus size={17} aria-hidden /> Novo aparelho
        </button>
      </div>

      {aberto === "novo" && (
        <div className="mt-4">
          <Formulario unidade={null} categorias={categorias} empresaId={empresaId} mudaPreco={mudaPreco} onFim={() => setAberto(null)} />
        </div>
      )}

      {unidades.length === 0 ? (
        <p className="mt-6 rounded-placa bg-vidro px-5 py-10 text-center text-[15.5px] text-grafite">Nenhum aparelho ainda. Adicione o primeiro.</p>
      ) : (
        <ul className="mt-4 divide-y divide-linha/80 border-y border-linha">
          {ordenadas.map((u) => {
            const s = SITUACAO[u.status] ?? SITUACAO.indisponivel;
            return (
              <li key={u.id} className="py-3">
                <div className="flex items-center gap-3.5">
                  <span className="escovado grid h-16 w-12 shrink-0 place-items-center overflow-hidden rounded-lg">
                    {u.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.foto_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Aparelho forma={formaDe(u.nome)} cor={corHex(u.cor, u.nome)} altura={46} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-semibold">{u.nome}</span>
                    <span className="block truncate text-[14px] text-grafite">
                      {resumo(u) || "Sem detalhes"}
                      {u.condicao === "seminovo" && " · seminovo"}
                      {!u.condicao && " · condição não informada"}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={clsx("rounded-full px-2 py-0.5 text-[12.5px] font-medium", s.cor)}>{s.nome}</span>
                      {u.segurado && (
                        <span className="flex items-center gap-1 rounded-full bg-ultramar-claro px-2 py-0.5 text-[12.5px] font-medium text-ultramar-escuro">
                          <Lock size={11} aria-hidden /> Segurado agora
                        </span>
                      )}
                      {u.preco == null && <span className="rounded-full bg-alerta-claro px-2 py-0.5 text-[12.5px] font-medium text-[#a3380a]">Sem preço: não aparece</span>}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[16px] font-semibold tabular-nums">{u.preco != null ? brl(u.preco) : "—"}</span>
                  <button
                    type="button"
                    onClick={() => setAberto(aberto === u.id ? null : u.id)}
                    aria-expanded={aberto === u.id}
                    className="h-11 shrink-0 rounded-campo border border-linha bg-branco px-3.5 text-[14.5px] font-medium"
                  >
                    {aberto === u.id ? "Fechar" : "Editar"}
                  </button>
                </div>
                {aberto === u.id && (
                  <div className="mt-3">
                    <Formulario unidade={u} categorias={categorias} empresaId={empresaId} mudaPreco={mudaPreco} onFim={() => setAberto(null)} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
