"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { agrupar, corHex, normalizar, textoBusca, whatsappLink, type DadosVitrine, type Item, type Modelo } from "@/lib/aparelho";
import { acertarRelogio, agoraDoServidor } from "./contagem";
import { BarraBusca, Cabecalho, CartaoModelo, Categorias, Controles, LinhaModelo, type CategoriaFiltro, type Ordem, type Visao } from "./catalogo";
import { Detalhe } from "./detalhe";
import { Bandeja, FecharPedido, type FormPedido, type ResultadoPedido } from "./pedido";

const MOTIVOS: Record<string, string> = {
  segurado: "Outro revendedor pegou este agora há pouco.",
  indisponivel: "Este aparelho acabou de sair da vitrine.",
  limite: "Sua bandeja está cheia. Feche o pedido ou solte um aparelho.",
  repetido: "Você já segurou este aparelho duas vezes. Para ficar com ele, fale com o vendedor.",
  link: "Este link de revenda não vale mais. Peça o link novo ao vendedor.",
};
const CHAVE_SESSAO = "cls-rv-sessao";
const CHAVE_VISAO = "cls-rv-visao";
const COR_CLARA = "#e6e8eb";
const COR_ESCURA = "#0a0b0f";

function lerSessao(): string {
  const nova = () => crypto.randomUUID();
  try {
    const salva = localStorage.getItem(CHAVE_SESSAO);
    if (salva && salva.length >= 16) return salva;
    const s = nova();
    localStorage.setItem(CHAVE_SESSAO, s);
    return s;
  } catch {
    return nova(); // navegador sem memória: a bandeja vale só enquanto a página estiver aberta
  }
}

function corDaBarra(cor: string) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", cor);
}

type Voo = { id: string; cor: string; de: DOMRect; para: { x: number; y: number } };
type Camada = null | { tipo: "detalhe"; chave: string; unidade: string } | { tipo: "pedido" };

export function Vitrine({ token, inicial }: { token: string; inicial: DadosVitrine | null }) {
  const supabase = useMemo(() => createClient(), []);
  const parado = Boolean(useReducedMotion());
  const [dados, setDados] = useState(inicial);
  const [situacao, setSituacao] = useState<"ok" | "falha" | "invalido">("ok");
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState("tudo");
  const [condicao, setCondicao] = useState("todos");
  const [ordem, setOrdem] = useState<Ordem>("relevancia");
  const [visao, setVisaoBruta] = useState<Visao>("cartoes");
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [camada, setCamada] = useState<Camada>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [voo, setVoo] = useState<Voo | null>(null);
  const sessao = useRef<string | null>(null);
  const versao = useRef(0);
  const barraRef = useRef<HTMLDivElement>(null);

  const carregar = useCallback(async () => {
    const v = versao.current;
    const { data, error } = await supabase.rpc("cat_revenda_vitrine", { p_token: token, p_sessao: sessao.current ?? undefined });
    if (v !== versao.current) return; // uma ação aconteceu no meio: esta resposta já está velha
    if (error) return setSituacao("falha");
    if (!data) return setSituacao("invalido");
    const d = data as unknown as DadosVitrine;
    acertarRelogio(d.agora);
    setSituacao("ok");
    setDados(d);
  }, [supabase, token]);

  // Ao abrir: identifica o navegador e passa a conferir a vitrine a cada 10 s enquanto a aba está visível.
  useEffect(() => {
    sessao.current = lerSessao();
    try {
      const v = localStorage.getItem(CHAVE_VISAO);
      if (v === "lista" || v === "cartoes") setVisaoBruta(v);
    } catch {
      // fica nos cartões
    }
    if (inicial) acertarRelogio(inicial.agora);
    carregar();
    const t = setInterval(() => document.visibilityState === "visible" && carregar(), 10_000);
    const voltar = () => document.visibilityState === "visible" && carregar();
    document.addEventListener("visibilitychange", voltar);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", voltar);
    };
  }, [carregar, inicial]);

  // Quando o próximo prazo vencer, atualiza na hora em vez de esperar os 10 s.
  useEffect(() => {
    const prazos = (dados?.itens ?? []).map((i) => (i.ate ? new Date(i.ate).getTime() : 0)).filter((t) => t > agoraDoServidor());
    if (!prazos.length) return;
    const t = setTimeout(carregar, Math.min(...prazos) - agoraDoServidor() + 700);
    return () => clearTimeout(t);
  }, [dados, carregar]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4200);
    return () => clearTimeout(t);
  }, [aviso]);

  // O botão voltar do celular fecha o palco ou a bandeja em vez de sair da página.
  useEffect(() => {
    const pop = () => setCamada(null);
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);

  const abrirCamada = useCallback((c: Exclude<Camada, null>) => {
    setCamada((atual) => {
      if (!atual) history.pushState({ clsCamada: true }, "");
      return c;
    });
  }, []);
  const fecharCamada = useCallback(() => {
    if (history.state?.clsCamada) history.back();
    else setCamada(null);
  }, []);

  // Página parada por baixo e barra do navegador na cor do palco.
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.style.overflow = camada ? "hidden" : "";
    corDaBarra(camada?.tipo === "detalhe" ? COR_ESCURA : COR_CLARA);
    return () => {
      raiz.style.overflow = "";
    };
  }, [camada]);

  const setVisao = (v: Visao) => {
    setVisaoBruta(v);
    try {
      localStorage.setItem(CHAVE_VISAO, v);
    } catch {
      // segue sem lembrar
    }
  };

  const itens = useMemo(() => dados?.itens ?? [], [dados]);
  const modelos = useMemo(() => agrupar(itens), [itens]);
  const meus = itens.filter((i) => i.estado === "meu");

  const categorias = useMemo<CategoriaFiltro[]>(() => {
    const mapa = new Map<string, CategoriaFiltro>();
    for (const i of itens) {
      const slug = i.categoria ?? "outros";
      const c = mapa.get(slug) ?? { slug, nome: i.categoria_nome ?? "Outros", n: 0, amostra: i };
      c.n++;
      mapa.set(slug, c);
    }
    return [{ slug: "tudo", nome: "Tudo", n: itens.length, amostra: null }, ...mapa.values()];
  }, [itens]);

  const naCategoria = useMemo(() => modelos.filter((m) => cat === "tudo" || (m.categoria ?? "outros") === cat), [modelos, cat]);

  const condicoes = useMemo(() => {
    const contar = (c: string) => naCategoria.filter((m) => m.condicao === c).reduce((s, m) => s + m.unidades.length, 0);
    const lista = [{ v: "todos", nome: "Todos", n: naCategoria.reduce((s, m) => s + m.unidades.length, 0) }];
    for (const [v, nome] of [
      ["lacrado", "Lacrados"],
      ["seminovo", "Seminovos"],
    ] as const) {
      const n = contar(v);
      if (n) lista.push({ v, nome, n });
    }
    return lista;
  }, [naCategoria]);

  const visiveis = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    const lista = naCategoria.filter((m) => (condicao === "todos" || m.condicao === condicao) && termos.every((t) => textoBusca(m).includes(t)));
    const melhorBateria = (m: Modelo) => Math.max(...m.unidades.map((u) => u.bateria ?? 0));
    if (ordem === "menor") lista.sort((a, b) => a.menor - b.menor);
    if (ordem === "maior") lista.sort((a, b) => b.maior - a.maior);
    if (ordem === "bateria") lista.sort((a, b) => melhorBateria(b) - melhorBateria(a));
    return lista;
  }, [naCategoria, condicao, busca, ordem]);

  const unidadesVisiveis = visiveis.reduce((s, m) => s + m.unidades.length, 0);
  const detalhe = camada?.tipo === "detalhe" ? modelos.find((m) => m.chave === camada.chave) : undefined;

  // O modelo do palco saiu da vitrine (vendido ou tirado pela loja): volta ao catálogo.
  useEffect(() => {
    if (camada?.tipo === "detalhe" && dados && !detalhe) fecharCamada();
  }, [camada, dados, detalhe, fecharCamada]);

  const mudar = (id: string, parte: Partial<Item>) =>
    setDados((d) => d && { ...d, itens: d.itens.map((i) => (i.id === id ? { ...i, ...parte } : i)) });

  async function pegar(item: Item, origem?: HTMLElement) {
    if (!sessao.current || !dados) return;
    versao.current++;
    mudar(item.id, { estado: "meu", ate: new Date(agoraDoServidor() + dados.loja.segura_minutos * 60_000).toISOString() });
    navigator.vibrate?.(14);
    const de = origem?.getBoundingClientRect();
    if (de && !parado) {
      const alvo = barraRef.current?.getBoundingClientRect();
      setVoo({
        id: item.id + Date.now(),
        cor: corHex(item.cor, item.nome),
        de,
        para: alvo ? { x: alvo.left + 34, y: alvo.top + alvo.height / 2 } : { x: 40, y: window.innerHeight - 44 },
      });
    }
    const { data, error } = await supabase.rpc("cat_revenda_segurar", { p_token: token, p_sessao: sessao.current, p_produto: item.id });
    const r = data as { ok: boolean; ate?: string; motivo?: string } | null;
    if (error || !r?.ok) {
      setAviso(MOTIVOS[r?.motivo ?? ""] ?? "Não deu para pegar agora. Tente de novo.");
      versao.current++;
      return carregar();
    }
    mudar(item.id, { estado: "meu", ate: r.ate ?? null });
  }

  async function soltar(item: Item) {
    if (!sessao.current) return;
    versao.current++;
    mudar(item.id, { estado: "livre", ate: null });
    const { error } = await supabase.rpc("cat_revenda_soltar", { p_token: token, p_sessao: sessao.current, p_produto: item.id });
    if (error) {
      versao.current++;
      carregar();
    }
  }

  async function enviar(f: FormPedido): Promise<ResultadoPedido> {
    if (!sessao.current) return { ok: false, motivo: "rede" };
    versao.current++;
    const { data, error } = await supabase.rpc("cat_revenda_pedir", {
      p_token: token,
      p_sessao: sessao.current,
      p_nome: f.nome,
      p_whatsapp: f.whatsapp,
      p_pagamento: f.pagamento,
      p_entrega: f.entrega,
      p_obs: f.obs,
      p_produtos: meus.map((i) => i.id),
    });
    await carregar();
    if (error || !data) return { ok: false, motivo: "rede" };
    return data as unknown as ResultadoPedido;
  }

  const limpar = () => {
    setBusca("");
    setCat("tudo");
    setCondicao("todos");
  };

  if (!dados) {
    const texto =
      situacao === "invalido"
        ? "Este link não abre nenhuma vitrine. Peça o link novo ao vendedor."
        : situacao === "falha"
          ? "Não consegui carregar a vitrine. Confira sua internet e tente de novo."
          : "Abrindo a vitrine…";
    return (
      <main className="grid min-h-dvh place-items-center px-8 text-center">
        <div>
          <p className="font-display text-[26px] font-semibold leading-tight tracking-tight">{texto}</p>
          {situacao === "falha" && (
            <button type="button" onClick={carregar} className="mt-6 h-12 rounded-2xl bg-ultramar px-6 text-[15.5px] font-semibold text-white">
              Tentar de novo
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <LayoutGroup>
      <main className="mx-auto min-h-dvh w-full max-w-[1180px] px-4 pb-32 lg:px-8">
        <Cabecalho loja={dados.loja} aparelhos={itens.length} />
        <BarraBusca busca={busca} onBusca={setBusca} visao={visao} onVisao={setVisao} />

        {itens.length === 0 ? (
          <p className="mt-16 text-center font-display text-[22px] font-semibold tracking-tight">A vitrine está sendo reposta. Volte daqui a pouco.</p>
        ) : (
          <>
            <Categorias categorias={categorias} cat={cat} onCat={setCat} />
            <Controles
              condicoes={condicoes}
              condicao={condicoes.some((c) => c.v === condicao) ? condicao : "todos"}
              onCondicao={setCondicao}
              ordem={ordem}
              onOrdem={setOrdem}
              resumo={`${visiveis.length} ${visiveis.length === 1 ? "modelo" : "modelos"} · ${unidadesVisiveis} ${unidadesVisiveis === 1 ? "aparelho" : "aparelhos"}`}
            />

            {visiveis.length === 0 ? (
              <div className="mt-10 rounded-[24px] bg-white px-6 py-10 text-center">
                <p className="font-display text-[20px] font-semibold tracking-tight">{busca ? `Nada com “${busca}”.` : "Nada aqui agora."}</p>
                <button type="button" onClick={limpar} className="mt-4 h-11 rounded-full bg-tinta px-5 text-[14.5px] font-semibold text-white">
                  Ver tudo
                </button>
              </div>
            ) : visao === "cartoes" ? (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5">
                {visiveis.map((m, k) => (
                  <CartaoModelo
                    key={m.chave}
                    m={m}
                    indice={k}
                    parado={parado}
                    escondePeca={detalhe?.chave === m.chave}
                    onAbrir={(unidade) => abrirCamada({ tipo: "detalhe", chave: m.chave, unidade })}
                  />
                ))}
              </div>
            ) : (
              <ul className="mt-3 grid gap-2.5 lg:grid-cols-2">
                {visiveis.map((m) => (
                  <LinhaModelo
                    key={m.chave}
                    m={m}
                    aberto={abertos.has(m.chave) || visiveis.length === 1}
                    onAlternar={() =>
                      setAbertos((a) => {
                        const n = new Set(a);
                        if (n.has(m.chave)) n.delete(m.chave);
                        else n.add(m.chave);
                        return n;
                      })
                    }
                    onAbrir={(unidade) => abrirCamada({ tipo: "detalhe", chave: m.chave, unidade })}
                    onPegar={(u, el) => pegar(u, el)}
                    onSoltar={soltar}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {/* Rodapé: a bandeja quando há aparelhos, senão o WhatsApp da loja */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[640px] justify-end">
        <AnimatePresence mode="popLayout">
          {meus.length > 0 ? (
            <Bandeja key="bandeja" itens={meus} barraRef={barraRef} onAbrir={() => abrirCamada({ tipo: "pedido" })} />
          ) : (
            dados.loja.whatsapp && (
              <motion.a
                key="zap"
                href={whatsappLink(dados.loja.whatsapp, "Olá! Vim pela vitrine de revenda da CLS.")}
                target="_blank"
                rel="noreferrer"
                aria-label="Falar com a loja no WhatsApp"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="pointer-events-auto m-4 mb-[max(16px,env(safe-area-inset-bottom))] grid h-14 w-14 place-items-center rounded-full bg-[#1fae5b] text-white shadow-[0_14px_30px_-10px_rgb(16_120_60/0.7)]"
              >
                <MessageCircle size={26} />
              </motion.a>
            )
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {camada?.tipo === "detalhe" && detalhe && (
          <motion.div
            key="fundo"
            aria-hidden
            onClick={fecharCamada}
            className="fixed inset-0 z-40 hidden bg-tinta/55 backdrop-blur-md lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
        {camada?.tipo === "detalhe" && detalhe && (
          <Detalhe
            key="detalhe"
            m={detalhe}
            unidadeId={camada.unidade}
            noCarrinho={meus.length}
            minutos={dados.loja.segura_minutos}
            parado={parado}
            onUnidade={(unidade) => setCamada({ tipo: "detalhe", chave: detalhe.chave, unidade })}
            onPegar={(u) => pegar(u)}
            onSoltar={soltar}
            onFechar={fecharCamada}
            onBandeja={() => meus.length && setCamada({ tipo: "pedido" })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {camada?.tipo === "pedido" && <FecharPedido itens={meus} loja={dados.loja} onFechar={fecharCamada} onSoltar={soltar} enviar={enviar} />}
      </AnimatePresence>

      {/* O aparelho "voa" da lista para a bandeja */}
      {voo && (
        <motion.span
          key={voo.id}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[45] h-7 w-7 rounded-full"
          style={{ background: voo.cor, boxShadow: "0 0 0 3px #fff, 0 10px 20px -6px rgb(0 0 0 / 0.5)" }}
          initial={{ x: voo.de.left + voo.de.width / 2 - 14, y: voo.de.top + voo.de.height / 2 - 14, scale: 1.4 }}
          animate={{ x: voo.para.x - 14, y: voo.para.y - 14, scale: 0.6 }}
          transition={{ duration: 0.6, ease: [0.5, 0, 0.2, 1] }}
          onAnimationComplete={() => setVoo(null)}
        />
      )}

      <AnimatePresence>
        {aviso && (
          <motion.p
            role="status"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="fixed inset-x-4 top-4 z-[60] mx-auto max-w-md rounded-2xl bg-tinta px-4 py-3 text-center text-[15px] font-medium text-white shadow-2xl"
          >
            {aviso}
          </motion.p>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
