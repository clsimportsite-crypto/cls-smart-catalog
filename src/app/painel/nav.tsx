"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import {
  BarChart3,
  Boxes,
  ChevronsUpDown,
  ClipboardCheck,
  FileUp,
  House,
  LogOut,
  Store,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Marca } from "@/components/marca";
import { sair, trocarLoja } from "./actions";
import type { LojaDoUsuario } from "@/lib/loja";

type Item = { href: string; rotulo: string; icone: LucideIcon; fase?: number; celular?: boolean };

// Itens com "fase" ainda não existem: aparecem desativados, com a fase em que chegam.
const ITENS: Item[] = [
  { href: "/painel", rotulo: "Início", icone: House, celular: true },
  { href: "/painel/importar", rotulo: "Importar", icone: FileUp, fase: 1, celular: true },
  { href: "/painel/revisao", rotulo: "Revisão", icone: ClipboardCheck, fase: 1 },
  { href: "/painel/produtos", rotulo: "Produtos", icone: Boxes, fase: 2, celular: true },
  { href: "/painel/precos", rotulo: "Preços", icone: Tags, fase: 2 },
  { href: "/painel/vitrine", rotulo: "Vitrine", icone: Store, fase: 4, celular: true },
  { href: "/painel/relatorios", rotulo: "Relatórios", icone: BarChart3, fase: 5 },
  { href: "/painel/equipe", rotulo: "Equipe", icone: Users, celular: true },
];

function ativo(caminho: string, href: string) {
  return href === "/painel" ? caminho === "/painel" : caminho.startsWith(href);
}

export function NavLateral({ lojas, atual, nome }: { lojas: LojaDoUsuario[]; atual: LojaDoUsuario; nome: string }) {
  const caminho = usePathname();
  const [trocando, iniciar] = useTransition();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col border-r border-linha/80 bg-vidro/70 px-4 py-6 backdrop-blur lg:flex">
      <div className="px-2">
        <Marca />
      </div>

      <div className="relative mt-8">
        <label htmlFor="loja" className="sr-only">
          Loja
        </label>
        <select
          id="loja"
          value={atual.empresaId}
          disabled={lojas.length < 2 || trocando}
          onChange={(e) => iniciar(() => trocarLoja(e.target.value))}
          className="h-12 w-full appearance-none rounded-campo border border-linha bg-branco pl-3.5 pr-10 text-left text-[15px] font-semibold text-tinta disabled:cursor-default disabled:opacity-100"
        >
          {lojas.map((l) => (
            <option key={l.empresaId} value={l.empresaId}>
              {l.nome}
            </option>
          ))}
        </select>
        {lojas.length > 1 && (
          <ChevronsUpDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-grafite" />
        )}
      </div>

      <nav aria-label="Painel" className="mt-6 flex-1">
        <ul className="space-y-0.5">
          {ITENS.map((it) => {
            const Icone = it.icone;
            const ligado = ativo(caminho, it.href);
            if (it.fase) {
              return (
                <li key={it.href}>
                  <span
                    aria-disabled
                    className="flex h-11 items-center gap-3 rounded-[11px] px-3 text-[15px] text-nevoa"
                    title={`Chega na fase ${it.fase}`}
                  >
                    <Icone size={18} strokeWidth={1.8} />
                    {it.rotulo}
                    <span className="ml-auto rounded-full border border-linha px-2 py-0.5 text-[11.5px] text-nevoa">
                      Fase {it.fase}
                    </span>
                  </span>
                </li>
              );
            }
            return (
              <li key={it.href} className="relative">
                {ligado && (
                  <motion.span
                    layoutId="nav-ativo"
                    className="absolute inset-0 rounded-[11px] bg-branco shadow-[0_1px_2px_rgb(21_23_28/0.08)] ring-1 ring-linha"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <Link
                  href={it.href}
                  aria-current={ligado ? "page" : undefined}
                  className={clsx(
                    "relative flex h-11 items-center gap-3 rounded-[11px] px-3 text-[15px] transition-colors",
                    ligado ? "font-semibold text-tinta" : "text-grafite hover:text-tinta",
                  )}
                >
                  <Icone size={18} strokeWidth={ligado ? 2.2 : 1.8} className={ligado ? "text-ultramar" : undefined} />
                  {it.rotulo}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-3 border-t border-linha/80 px-2 pt-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tinta font-display text-[14px] font-semibold uppercase text-white">
          {nome.slice(0, 1)}
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{nome}</span>
        <form action={sair}>
          <button type="submit" className="grid h-9 w-9 place-items-center rounded-full text-grafite transition hover:bg-branco hover:text-tinta" aria-label="Sair">
            <LogOut size={17} />
          </button>
        </form>
      </div>
    </aside>
  );
}

export function NavCelular() {
  const caminho = usePathname();
  const itens = ITENS.filter((i) => i.celular);

  return (
    <nav
      aria-label="Painel"
      className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 rounded-[22px] bg-tinta/95 p-1.5 shadow-[0_18px_40px_-16px_rgb(21_23_28/0.7)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {itens.map((it) => {
          const Icone = it.icone;
          const ligado = ativo(caminho, it.href);
          const desligado = Boolean(it.fase);
          const conteudo = (
            <>
              {ligado && (
                <motion.span
                  layoutId="nav-celular"
                  className="absolute inset-0 rounded-[16px] bg-white/12"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <Icone size={20} strokeWidth={ligado ? 2.2 : 1.8} className="relative" />
              <span className="relative text-[11px]">{it.rotulo}</span>
            </>
          );
          return (
            <li key={it.href} className="relative">
              {desligado ? (
                <span aria-disabled className="flex h-14 flex-col items-center justify-center gap-1 text-white/30">
                  {conteudo}
                </span>
              ) : (
                <Link
                  href={it.href}
                  aria-current={ligado ? "page" : undefined}
                  className={clsx(
                    "relative flex h-14 flex-col items-center justify-center gap-1 rounded-[16px]",
                    ligado ? "text-white" : "text-white/65",
                  )}
                >
                  {conteudo}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
