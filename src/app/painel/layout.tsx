import { carregarSessao } from "@/lib/loja";
import { Marca } from "@/components/marca";
import { NavCelular, NavLateral } from "./nav";
import { sair } from "./actions";

export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const sessao = await carregarSessao();

  if (!sessao.atual) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="max-w-md text-center">
          <Marca className="justify-center" />
          <h1 className="mt-8 font-display text-[28px] font-semibold tracking-tight">Você ainda não está em nenhuma loja</h1>
          <p className="mt-3 text-[16px] text-grafite">
            Peça ao dono da loja para te convidar. Assim que ele fizer isso, o painel aparece aqui.
          </p>
          <form action={sair} className="mt-8">
            <button className="h-11 rounded-campo border border-linha bg-branco px-5 text-[15px] font-medium">Sair</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <NavLateral lojas={sessao.lojas} atual={sessao.atual} nome={sessao.nome} />
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between px-5 pt-5 lg:hidden">
          <Marca compacta />
          <span className="text-[14px] font-semibold">{sessao.atual.nome}</span>
        </header>
        <div className="mx-auto w-full max-w-[1120px] px-5 pb-32 pt-6 sm:px-8 lg:px-12 lg:pb-16 lg:pt-12">{children}</div>
      </div>
      <NavCelular />
    </div>
  );
}
