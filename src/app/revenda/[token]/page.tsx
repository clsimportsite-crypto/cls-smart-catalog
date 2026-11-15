import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Vitrine } from "@/components/vitrine/vitrine";
import type { DadosVitrine } from "@/lib/aparelho";

export const metadata: Metadata = { title: "Revenda", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#0a0b0f", width: "device-width", initialScale: 1 };

/** Vitrine de revenda: pública, mas só abre com o código do link que a loja envia. */
export default async function PaginaRevenda({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{16,64}$/.test(token)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cat_revenda_vitrine", { p_token: token });
  if (!error && data === null) notFound();

  // Se a leitura falhar aqui, a própria vitrine tenta de novo no navegador.
  return <Vitrine token={token} inicial={error ? null : (data as unknown as DadosVitrine)} />;
}
