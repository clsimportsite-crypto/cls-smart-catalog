// Lê as variáveis públicas do Supabase e falha com uma mensagem clara se faltarem.
// As duas precisam ser lidas por nome literal para o Next.js embuti-las no navegador.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseEnv() {
  if (!url || !anonKey) {
    throw new Error(
      "Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. Configure no Netlify ou no arquivo .env.local.",
    );
  }
  return { url, anonKey };
}
