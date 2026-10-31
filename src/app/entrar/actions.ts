"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoEntrar = { erro?: string; email?: string };

export async function entrar(_anterior: EstadoEntrar, dados: FormData): Promise<EstadoEntrar> {
  const email = String(dados.get("email") ?? "").trim().toLowerCase();
  const senha = String(dados.get("senha") ?? "");

  if (!email || !senha) return { erro: "Preencha o e-mail e a senha.", email };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: "Esse e-mail não parece completo. Confira.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    const msg =
      error.message === "Invalid login credentials"
        ? "E-mail ou senha não conferem. Use o mesmo acesso do CLS Control."
        : "Não foi possível entrar agora. Tente de novo em instantes.";
    return { erro: msg, email };
  }

  redirect("/painel");
}
