import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "@/lib/env";
import type { Database } from "./database.types";

/** Renova a sessão a cada requisição e protege o painel. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = supabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista) {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const caminho = request.nextUrl.pathname;
  if (!user && caminho.startsWith("/painel")) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/entrar";
    return NextResponse.redirect(destino);
  }
  if (user && caminho === "/entrar") {
    const destino = request.nextUrl.clone();
    destino.pathname = "/painel";
    return NextResponse.redirect(destino);
  }
  return response;
}
