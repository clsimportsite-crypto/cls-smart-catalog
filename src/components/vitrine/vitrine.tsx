"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { corHex, type DadosVitrine, type Item } from "@/lib/aparelho";
import { acertarRelogio, agoraDoServidor } from "./contagem";
import { Elenco, Filtros, type Categoria } from "./elenco";
import { Palco } from "./palco";
import { Bandeja, FecharPedido, type FormPedido, type ResultadoPedido } from "./pedido";

const MOTIVOS: Record<string, string> = {
  segurado: "Outro revendedor pegou este agora há pouco.",
  indisponivel: "Este aparelho acabou de sair da vitrine.",
  limite: "Sua bandeja está cheia. Feche o pedido ou solte um aparelho.",
  link: "Este link de revenda não vale mais. Peça o link novo ao vendedor.",
};
const CHAVE_SESSAO = "cls-rv-sessao";

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

type Voo = { id: string; cor: string; de: DOMRect; para: { x: number; y: number } };

export function Vitrine({ token, inicial }: { token: string; inicial: DadosVitrine | null }) {
  const supabase = useMemo(() => createClient(), []);
  const parado = Boolean(useReducedMotion());
  const [dados, setDados] = useState(inicial);
  const [situacao, setSituacao] = useState<"ok" | "falha" | "invalido">("ok");
  const [sel, setSel] = useState<string | null>(inicial?.itens[0]?.id ?? null);
  const [dir, setDir] = useState(1);
  const [cat, setCat] = useState("tudo");
  const [teto, setTeto] = useState<number | null>(null);
  const [aberto, setAberto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [voo, setVoo] = useState<Voo | null>(null);
  const sessao = useRef<string | null>(null);
  const versao = useRef(0);
  const pecaRef = useRef<HTMLDivElement>(null);
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

  const itens = useMemo(() => dados?.itens ?? [], [dados]);
  const visiveis = useMemo(() => itens.filter((i) => cat === "tudo" || i.categoria === cat), [itens, cat]);
  const atual = itens.find((i) => i.id === sel) ?? visiveis[0] ?? itens[0] ?? null;
  const meus = itens.filter((i) => i.estado === "meu");
  const precos = itens.map((i) => i.preco);
  const faixa: [number, number] = precos.length ? [Math.min(...precos), Math.max(...precos)] : [0, 0];
  const tetoAtual = Math.min(teto ?? faixa[1], faixa[1]) || faixa[1];

  const categorias = useMemo<Categoria[]>(() => {
    const mapa = new Map<string, Categoria>();
    for (const i of itens) {
      const slug = i.categoria ?? "outros";
      const c = mapa.get(slug) ?? { slug, nome: i.categoria_nome ?? "Outros", n: 0 };
      c.n++;
      mapa.set(slug, c);
    }
    return [{ slug: "tudo", nome: "Tudo", n: itens.length }, ...mapa.values()];
  }, [itens]);

  const selecionar = useCallback(
    (id: string) => {
      const [de, para] = [visiveis.findIndex((i) => i.id === atual?.id), visiveis.findIndex((i) => i.id === id)];
      setDir(para >= de ? 1 : -1);
      setSel(id);
    },
    [visiveis, atual],
  );

  const vizinho = useCallback(
    (passo: 1 | -1) => {
      if (visiveis.length < 2) return;
      const n = visiveis.findIndex((i) => i.id === atual?.id);
      setDir(passo);
      setSel(visiveis[(n + passo + visiveis.length) % visiveis.length].id);
    },
    [visiveis, atual],
  );

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (aberto || (e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "ArrowRight") vizinho(1);
      if (e.key === "ArrowLeft") vizinho(-1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberto, vizinho]);

  const mudar = (id: string, parte: Partial<Item>) =>
    setDados((d) => d && { ...d, itens: d.itens.map((i) => (i.id === id ? { ...i, ...parte } : i)) });

  async function pegar(item: Item) {
    if (!sessao.current || !dados) return;
    versao.current++;
    mudar(item.id, { estado: "meu", ate: new Date(agoraDoServidor() + dados.loja.segura_minutos * 60_000).toISOString() });
    navigator.vibrate?.(14);
    const de = pecaRef.current?.getBoundingClientRect();
    if (de && !parado) {
      const alvo = barraRef.current?.getBoundingClientRect();
      setVoo({
        id: item.id,
        cor: corHex(item.cor, item.nome),
        de,
        para: alvo ? { x: alvo.left + 30, y: alvo.top + alvo.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight - 50 },
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

  const fechar = useCallback(() => setAberto(false), []);

  if (!dados || !atual) {
    const texto =
      situacao === "invalido"
        ? "Este link não abre nenhuma vitrine. Peça o link novo ao vendedor."
        : situacao === "falha"
          ? "Não consegui carregar a vitrine. Confira sua internet e tente de novo."
          : dados
            ? "A vitrine está sendo reposta. Volte daqui a pouco."
            : "Abrindo a vitrine…";
    return (
      <main className="vitrine grid h-dvh place-items-center bg-noite px-8 text-center text-white">
        <div>
          <p className="font-display text-[26px] font-semibold leading-tight tracking-tight">{texto}</p>
          {situacao === "falha" && (
            <button type="button" onClick={carregar} className="mt-6 h-12 rounded-2xl bg-ultramar px-6 text-[15.5px] font-semibold">
              Tentar de novo
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="vitrine relative flex h-dvh flex-col overflow-hidden bg-noite text-white lg:flex-row">
      <section className="relative shrink-0 lg:min-w-0 lg:flex-1">
        <header className="relative z-10 flex items-center justify-between px-4 pb-1 pt-4 lg:absolute lg:inset-x-0 lg:top-0 lg:px-14 lg:pt-8">
          <p className="flex items-center gap-2.5">
            <span className="grid h-8 w-11 place-items-center rounded-[9px] bg-ultramar font-display text-[15px] font-bold tracking-tight shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)]">CLS</span>
            <span className="font-display text-[17px] font-semibold tracking-tight">Revenda</span>
          </p>
          <p className="flex items-center gap-2 text-[13.5px] text-white/70">
            <span className="relative grid h-2 w-2 place-items-center">
              {!parado && <span className="absolute h-full w-full animate-ping rounded-full bg-[#46e0a0] opacity-70" />}
              <span className="h-2 w-2 rounded-full bg-[#46e0a0]" />
            </span>
            {itens.length} {itens.length === 1 ? "unidade" : "unidades"} ao vivo
          </p>
        </header>
        <Palco
          item={atual}
          dir={dir}
          minutos={dados.loja.segura_minutos}
          parado={parado}
          pecaRef={pecaRef}
          onPegar={() => pegar(atual)}
          onSoltar={() => soltar(atual)}
          onVizinho={vizinho}
        />
      </section>

      <section className="relative z-10 flex min-h-0 flex-1 flex-col rounded-t-[26px] bg-breu shadow-[0_-1px_0_rgb(255_255_255/0.08)] lg:w-[480px] lg:flex-none lg:rounded-none lg:shadow-[-1px_0_0_rgb(255_255_255/0.08)]">
        <Filtros categorias={categorias} cat={cat} onCat={setCat} teto={tetoAtual} faixa={faixa} onTeto={setTeto} />
        <div className="sem-barra min-h-0 flex-1 overflow-y-auto">
          <Elenco itens={visiveis} sel={atual.id} teto={tetoAtual} parado={parado} onSel={selecionar} />
        </div>
        <AnimatePresence>{meus.length > 0 && <Bandeja itens={meus} barraRef={barraRef} onAbrir={() => setAberto(true)} />}</AnimatePresence>
      </section>

      {/* O aparelho "voa" do palco para a bandeja */}
      {voo && (
        <motion.span
          key={voo.id}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-40 rounded-[18px]"
          style={{ width: voo.de.width, height: voo.de.height, background: voo.cor, boxShadow: "inset 0 0 0 2px rgb(255 255 255 / 0.35)" }}
          initial={{ x: voo.de.left, y: voo.de.top, scale: 1, opacity: 0.85 }}
          animate={{ x: voo.para.x - voo.de.width / 2, y: voo.para.y - voo.de.height / 2, scale: 0.08, opacity: 0.2, rotate: 24 }}
          transition={{ duration: 0.55, ease: [0.5, 0, 0.2, 1] }}
          onAnimationComplete={() => setVoo(null)}
        />
      )}

      <AnimatePresence>
        {aberto && <FecharPedido itens={meus} loja={dados.loja} onFechar={fechar} onSoltar={soltar} enviar={enviar} />}
      </AnimatePresence>

      <AnimatePresence>
        {aviso && (
          <motion.p
            role="status"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="fixed inset-x-4 top-4 z-[60] mx-auto max-w-md rounded-2xl bg-white px-4 py-3 text-center text-[15px] font-medium text-noite shadow-2xl"
          >
            {aviso}
          </motion.p>
        )}
      </AnimatePresence>
    </main>
  );
}
