"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { carregarSessao } from "@/lib/loja";

export type Resposta = { erro?: string; id?: string };

export type DadosProduto = {
  id?: string;
  nome: string;
  categoria_id: string | null;
  armazenamento: string;
  detalhe: string;
  cor: string;
  condicao: string;
  bateria: string;
  preco: string;
  status: string;
};

const CONDICOES = ["lacrado", "seminovo", "usado", "cpo"];
const STATUS = ["ativo", "indisponivel", "vendido", "arquivado"];
const texto = (v: string) => v.trim() || null;

function slugDe(...partes: (string | null)[]) {
  const base = partes
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "aparelho"}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Cria ou edita uma unidade. O preço só muda para dono e gerente (o banco também garante). */
export async function salvarProduto(d: DadosProduto): Promise<Resposta> {
  const sessao = await carregarSessao();
  const loja = sessao.atual;
  if (!loja) return { erro: "Você não está em nenhuma loja." };

  const nome = d.nome.trim();
  if (!nome) return { erro: "Dê um nome ao aparelho." };
  const bateria = d.bateria.trim() ? Number(d.bateria) : null;
  if (bateria != null && (!Number.isInteger(bateria) || bateria < 1 || bateria > 100)) return { erro: "A bateria vai de 1 a 100." };
  const preco = d.preco.trim() ? Number(d.preco.replace(/\./g, "").replace(",", ".")) : null;
  if (preco != null && !(preco > 0)) return { erro: "O preço precisa ser maior que zero." };
  if (!STATUS.includes(d.status)) return { erro: "Situação inválida." };

  const supabase = await createClient();
  const campos = {
    nome,
    categoria_id: d.categoria_id || null,
    armazenamento: texto(d.armazenamento),
    detalhe: texto(d.detalhe),
    cor: texto(d.cor),
    condicao: CONDICOES.includes(d.condicao) ? d.condicao : null,
    bateria,
    status: d.status,
  };

  let id = d.id;
  if (id) {
    const { error } = await supabase.from("cat_produtos").update(campos).eq("id", id).eq("empresa_id", loja.empresaId);
    if (error) return { erro: "Não deu para salvar. Tente de novo." };
  } else {
    const { data, error } = await supabase
      .from("cat_produtos")
      .insert({ ...campos, empresa_id: loja.empresaId, slug: slugDe(nome, campos.armazenamento, campos.cor) })
      .select("id")
      .single();
    if (error || !data) return { erro: "Não deu para criar o aparelho. Tente de novo." };
    id = data.id;
  }

  if (preco != null && loja.papel !== "editor") {
    const { error } = await supabase
      .from("cat_precos")
      .upsert({ empresa_id: loja.empresaId, produto_id: id, canal: "revenda", preco_vista: preco, origem: "manual" }, { onConflict: "produto_id,canal" });
    if (error) return { erro: "O aparelho foi salvo, mas o preço não. Confira o valor.", id };
  }

  revalidatePath("/painel", "layout");
  return { id };
}

export async function definirFoto(id: string, url: string | null): Promise<Resposta> {
  const sessao = await carregarSessao();
  if (!sessao.atual) return { erro: "Você não está em nenhuma loja." };
  const supabase = await createClient();
  const { error } = await supabase.from("cat_produtos").update({ foto_url: url }).eq("id", id).eq("empresa_id", sessao.atual.empresaId);
  if (error) return { erro: "Não deu para salvar a foto." };
  revalidatePath("/painel/produtos");
  return { id };
}

export async function resolverPedido(id: string, acao: "confirmar" | "cancelar"): Promise<Resposta> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cat_pedido_resolver", { p_pedido: id, p_acao: acao });
  if (error) return { erro: error.message.includes("disponível") || error.message.includes("resolvido") ? error.message : "Não deu para atualizar o pedido." };
  revalidatePath("/painel", "layout");
  return { id };
}

export async function salvarVitrine(d: { whatsapp: string; minutos: string; retiradas: string }): Promise<Resposta> {
  const sessao = await carregarSessao();
  if (!sessao.atual) return { erro: "Você não está em nenhuma loja." };
  const whatsapp = d.whatsapp.replace(/\D/g, "");
  if (whatsapp && (whatsapp.length < 10 || whatsapp.length > 13)) return { erro: "O WhatsApp precisa ter DDD (10 a 13 dígitos)." };
  const minutos = Number(d.minutos);
  if (!Number.isInteger(minutos) || minutos < 1 || minutos > 240) return { erro: "O tempo de segurar vai de 1 a 240 minutos." };
  const retiradas = d.retiradas
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("cat_lojas")
    .update({ whatsapp: whatsapp || null, segura_minutos: minutos, retiradas }, { count: "exact" })
    .eq("empresa_id", sessao.atual.empresaId);
  if (error || !count) return { erro: "Só o dono e o gerente mudam a vitrine." };
  revalidatePath("/painel/vitrine");
  return {};
}
