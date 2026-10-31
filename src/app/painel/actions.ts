"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_LOJA } from "@/lib/loja";

export async function trocarLoja(empresaId: string) {
  const supabase = await createClient();
  // Só aceita uma loja da qual a pessoa é membro (a regra do banco também garante).
  const { data } = await supabase.from("cat_lojas").select("empresa_id").eq("empresa_id", empresaId).maybeSingle();
  if (!data) return;
  (await cookies()).set(COOKIE_LOJA, empresaId, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/painel", "layout");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(COOKIE_LOJA);
  redirect("/entrar");
}
