"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { entrar, type EstadoEntrar } from "./actions";

const inicial: EstadoEntrar = {};

export function FormEntrar() {
  const [estado, acao, enviando] = useActionState(entrar, inicial);
  const [verSenha, setVerSenha] = useState(false);

  return (
    <form action={acao} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-[14px] font-medium text-tinta">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          defaultValue={estado.email}
          required
          className="h-12 w-full rounded-campo border border-linha bg-branco px-4 text-[16px] text-tinta outline-none transition placeholder:text-nevoa focus:border-ultramar focus:ring-4 focus:ring-ultramar/15"
          placeholder="voce@clsimport.com.br"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="senha" className="block text-[14px] font-medium text-tinta">
          Senha
        </label>
        <div className="relative">
          <input
            id="senha"
            name="senha"
            type={verSenha ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-12 w-full rounded-campo border border-linha bg-branco pl-4 pr-12 text-[16px] text-tinta outline-none transition focus:border-ultramar focus:ring-4 focus:ring-ultramar/15"
          />
          <button
            type="button"
            onClick={() => setVerSenha((v) => !v)}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-grafite transition hover:text-tinta"
            aria-label={verSenha ? "Esconder senha" : "Mostrar senha"}
          >
            {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {estado.erro && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-campo bg-alerta-claro px-4 py-3 text-[14px] text-[#a3380a]"
          >
            {estado.erro}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={enviando}
        className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-campo bg-ultramar text-[16px] font-semibold text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.2),0_10px_24px_-12px_rgb(34_54_240/0.8)] transition active:scale-[0.99] disabled:opacity-70 hover:bg-ultramar-escuro"
      >
        {enviando ? (
          <>
            <LoaderCircle size={18} className="animate-spin" /> Entrando
          </>
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  );
}
