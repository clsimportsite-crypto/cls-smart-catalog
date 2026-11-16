// Tudo o que a vitrine e o painel precisam saber sobre uma unidade:
// o formato do desenho, a cor em hexadecimal e os textos curtos.

export type Estado = "livre" | "meu" | "pedido" | "segurado";

export type Item = {
  id: string;
  nome: string;
  armazenamento: string | null;
  detalhe: string | null;
  cor: string | null;
  condicao: string | null;
  bateria: number | null;
  foto: string | null;
  categoria: string | null;
  categoria_nome: string | null;
  preco: number;
  preco_de: number | null;
  estado: Estado;
  ate: string | null;
};

export type DadosVitrine = {
  loja: { nome: string; whatsapp: string | null; segura_minutos: number; retiradas: string[] };
  agora: string;
  itens: Item[];
};

export type Forma =
  | "duoV"
  | "duoD"
  | "pilula"
  | "solo"
  | "tri"
  | "barra"
  | "triV"
  | "tablet"
  | "tabletIlha"
  | "relogio"
  | "mouse"
  | "caixa";

const semAcento = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Qual desenho representa o aparelho: a câmera certa para cada geração. */
export function formaDe(nome: string, categoria?: string | null): Forma {
  const n = semAcento(nome);
  if (/watch|relogio/.test(n)) return "relogio";
  if (/mouse/.test(n)) return "mouse";
  if (/ipad/.test(n)) return "tablet";
  if (/\b(pad|tab)\b/.test(n)) return "tabletIlha";

  if (/iphone/.test(n) || categoria === "iphone") {
    const geracao = Number(n.match(/\b(1\d)\b|\b(1\d)e\b/)?.slice(1).find(Boolean) ?? 0);
    const pro = /\bpro\b/.test(n);
    if (/\b\d\de\b|\bse\b|\bair\b/.test(n)) return "solo";
    if (pro) return geracao >= 17 ? "barra" : "tri";
    if (geracao >= 16) return "pilula";
    if (geracao >= 13) return "duoD";
    return "duoV";
  }
  if (categoria === "acessorios") return "caixa";
  return "triV";
}

const CORES: [RegExp, string][] = [
  [/meia.?noite|midnight/, "#1f252e"],
  [/grafite|graphite|espacial|space/, "#4b4d51"],
  [/pret[oa]|black/, "#1d1e21"],
  [/natural/, "#b9b2a6"],
  [/desert|areia/, "#c8ab8e"],
  [/branc[oa]|white|estelar|starlight/, "#ebe9e3"],
  [/prata|silver/, "#dcdde0"],
  [/dourad|gold/, "#e8d5b5"],
  [/rosa|pink/, "#f2c8d2"],
  [/rox[oa]|purple|lilas|lavanda/, "#b9a7d6"],
  [/verde|green/, "#b9d8c2"],
  [/amarel|yellow/, "#f2dc8c"],
  [/laranja|orange/, "#e8752a"],
  [/vermelh|red/, "#b4202a"],
  [/cinza|gray|grey/, "#6a6d73"],
];

/** A cor escrita na lista vira uma cor de tela. Sem palpite: cor desconhecida fica titânio neutro. */
export function corHex(cor: string | null, nome = ""): string {
  const c = semAcento(cor ?? "");
  const n = semAcento(nome);
  if (/azul|blue/.test(c)) {
    if (/profund|deep/.test(c) || /17 pro/.test(n)) return "#2c3a5c";
    if (/12 pro|13 pro/.test(n)) return "#2f4f6b";
    if (/ipad/.test(n)) return "#b9cde0";
    if (/iphone 15|iphone 16/.test(n)) return "#cfdde6";
    return "#5b7fa6";
  }
  for (const [padrao, hex] of CORES) if (padrao.test(c)) return hex;
  return "#8d929b";
}

const canais = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export function misturar(a: string, b: string, t: number): string {
  const [x, y] = [canais(a), canais(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

export function ehEscura(hex: string): boolean {
  const [r, g, b] = canais(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 110;
}

/** A luz que o aparelho joga no palco. Aparelho escuro ganha um brilho frio para não sumir. */
export function luzDe(hex: string): string {
  return ehEscura(hex) ? misturar(hex, "#8f9bc4", 0.62) : misturar(hex, "#ffffff", 0.1);
}

export const NOME_CONDICAO: Record<string, string> = {
  lacrado: "Lacrado",
  seminovo: "Seminovo",
  usado: "Usado",
  cpo: "CPO",
};

export const NOME_PAGAMENTO: Record<string, string> = {
  pix: "Pix à vista",
  dinheiro: "Dinheiro",
  cartao: "Cartão em até 21x",
  pix_cartao: "Entrada no Pix + cartão",
};

export function brl(valor: number): string {
  return "R$ " + valor.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/** "256 GB · Branco · 93% de bateria" */
export function resumo(i: Pick<Item, "armazenamento" | "detalhe" | "cor" | "bateria" | "condicao">): string {
  return [
    i.armazenamento,
    i.detalhe,
    i.cor,
    i.bateria != null ? `${i.bateria}% de bateria` : null,
    i.condicao === "lacrado" ? "lacrado" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Milissegundos que faltam viram "14:32". */
export function relogio(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Só os dígitos, com o 55 do Brasil na frente quando falta. */
export function whatsappLink(numero: string, texto: string): string {
  const d = numero.replace(/\D/g, "");
  return `https://wa.me/${d.length <= 11 ? "55" + d : d}?text=${encodeURIComponent(texto)}`;
}

/** Um modelo na vitrine: as unidades com o mesmo nome, memória, detalhe e condição. */
export type Modelo = {
  chave: string;
  nome: string;
  armazenamento: string | null;
  detalhe: string | null;
  condicao: string | null;
  categoria: string | null;
  categoria_nome: string | null;
  unidades: Item[];
  menor: number;
  maior: number;
};

export function agrupar(itens: Item[]): Modelo[] {
  const mapa = new Map<string, Modelo>();
  for (const i of itens) {
    const chave = [i.nome, i.armazenamento, i.detalhe, i.condicao].map((v) => v ?? "").join("|").toLowerCase();
    let m = mapa.get(chave);
    if (!m) {
      m = { chave, nome: i.nome, armazenamento: i.armazenamento, detalhe: i.detalhe, condicao: i.condicao, categoria: i.categoria, categoria_nome: i.categoria_nome, unidades: [], menor: i.preco, maior: i.preco };
      mapa.set(chave, m);
    }
    m.unidades.push(i);
    m.menor = Math.min(m.menor, i.preco);
    m.maior = Math.max(m.maior, i.preco);
  }
  for (const m of mapa.values()) {
    m.unidades.sort((a, b) => a.preco - b.preco || (b.bateria ?? 0) - (a.bateria ?? 0) || a.id.localeCompare(b.id));
  }
  return [...mapa.values()];
}

/** "89–93%" ou "95%". Vazio quando nenhuma unidade informa bateria. */
export function faixaBateria(unidades: Item[]): string {
  const b = unidades.map((u) => u.bateria).filter((v): v is number => v != null);
  if (!b.length) return "";
  const [min, max] = [Math.min(...b), Math.max(...b)];
  return min === max ? `${min}%` : `${min}–${max}%`;
}

/** Tudo o que se pode buscar num modelo, sem acento e em minúsculas. */
export function textoBusca(m: Modelo): string {
  return semAcento([m.nome, m.armazenamento, m.detalhe, m.categoria_nome, m.condicao ? NOME_CONDICAO[m.condicao] : "", ...m.unidades.map((u) => u.cor ?? "")].join(" "));
}

export const normalizar = semAcento;
