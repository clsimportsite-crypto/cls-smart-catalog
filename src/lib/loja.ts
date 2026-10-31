import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const COOKIE_LOJA = "cat_loja";

export type Papel = "dono" | "gerente" | "editor";

export type LojaDoUsuario = {
  empresaId: string;
  nome: string;
  slug: string;
  papel: Papel;
};

export type Sessao = {
  userId: string;
  email: string;
  nome: string;
  lojas: LojaDoUsuario[];
  atual: LojaDoUsuario | null;
};

/** Quem está logado, em quais lojas trabalha e qual loja está aberta agora. */
export async function carregarSessao(): Promise<Sessao> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const [{ data: membros }, { data: lojas }, { data: perfil }] = await Promise.all([
    supabase.from("cat_membros").select("empresa_id, papel").eq("user_id", user.id).eq("ativo", true),
    supabase.from("cat_lojas").select("empresa_id, nome, slug").order("nome"),
    supabase.from("usuarios").select("nome").eq("id", user.id).maybeSingle(),
  ]);

  const lista: LojaDoUsuario[] = (lojas ?? []).flatMap((l) => {
    const m = (membros ?? []).find((x) => x.empresa_id === l.empresa_id);
    return m ? [{ empresaId: l.empresa_id, nome: l.nome, slug: l.slug, papel: m.papel as Papel }] : [];
  });

  const escolhida = (await cookies()).get(COOKIE_LOJA)?.value;
  const atual = lista.find((l) => l.empresaId === escolhida) ?? lista[0] ?? null;

  const email = user.email ?? "";
  const nome = perfil?.nome?.trim() || email.split("@")[0] || "você";

  return { userId: user.id, email, nome, lojas: lista, atual };
}

export const NOME_PAPEL: Record<Papel, string> = {
  dono: "Dono",
  gerente: "Gerente",
  editor: "Editor",
};
