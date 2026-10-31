import type { Metadata } from "next";
import { Marca } from "@/components/marca";
import { ListaViva } from "@/components/lista-viva";
import { FormEntrar } from "./form";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaEntrar() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.15fr_1fr]">
      {/* Lado da história: a lista virando ficha */}
      <section className="escovado relative order-2 flex flex-col justify-between gap-10 overflow-hidden px-6 pb-10 pt-12 sm:px-10 lg:order-1 lg:px-14 lg:py-12">
        <Marca className="hidden lg:inline-flex" />
        <div className="grid items-end gap-10 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-[30rem]">
            <h1 className="font-display text-[clamp(2.4rem,5vw,4.1rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-tinta">
              A lista do fornecedor vira vitrine.
            </h1>
            <p className="mt-5 max-w-[26rem] text-[17px] leading-relaxed text-grafite">
              Cole o que chegou no WhatsApp. O sistema organiza modelo, memória, cor e condição, e o que estiver em
              dúvida espera a sua revisão.
            </p>
          </div>
          <ListaViva />
        </div>
        <p className="text-[13px] text-nevoa">Exemplo ilustrativo. Nenhum dado real aparece nesta tela.</p>
      </section>

      {/* Lado do acesso */}
      <section className="order-1 flex items-center justify-center bg-vidro px-6 pb-12 pt-8 sm:px-10 lg:order-2 lg:py-14">
        <div className="w-full max-w-[380px]">
          <Marca className="mb-10 lg:hidden" />
          <h2 className="font-display text-[28px] font-semibold tracking-[-0.02em]">Entrar no painel</h2>
          <p className="mb-8 mt-2 text-[15px] text-grafite">Use o mesmo e-mail e senha do CLS Control.</p>
          <FormEntrar />
        </div>
      </section>
    </main>
  );
}
