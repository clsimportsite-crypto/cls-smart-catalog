-- CLS Smart Catalog · Fase 0 · Fundação
-- Só cria objetos novos (prefixo cat_). Não altera nenhuma tabela do CLS Control.

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------
create or replace function public.cat_touch() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Membros (quem trabalha em cada loja) + funções de permissão
-- ---------------------------------------------------------------------------
create table public.cat_membros (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  papel       text not null check (papel in ('dono','gerente','editor')),
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (empresa_id, user_id)
);
create index cat_membros_user_idx on public.cat_membros(user_id);

create or replace function public.cat_papel(eid uuid) returns text
language sql stable security definer set search_path = public as $$
  select papel from public.cat_membros
  where empresa_id = eid and user_id = auth.uid() and ativo
$$;

create or replace function public.cat_membro(eid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.cat_papel(eid) is not null
$$;

create or replace function public.cat_gestor(eid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.cat_papel(eid) in ('dono','gerente'), false)
$$;

revoke all on function public.cat_papel(uuid), public.cat_membro(uuid), public.cat_gestor(uuid) from public, anon;
grant execute on function public.cat_papel(uuid), public.cat_membro(uuid), public.cat_gestor(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Loja (dados da vitrine)
-- ---------------------------------------------------------------------------
create table public.cat_lojas (
  id               uuid primary key default gen_random_uuid(),
  empresa_id       uuid not null unique references public.empresas(id) on delete cascade,
  slug             text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,39}$'),
  nome             text not null check (length(trim(nome)) > 0),
  logo_url         text,
  cor_primaria     text check (cor_primaria ~ '^#[0-9a-fA-F]{6}$'),
  cor_secundaria   text check (cor_secundaria ~ '^#[0-9a-fA-F]{6}$'),
  whatsapp         text check (whatsapp ~ '^[0-9]{10,13}$'),
  instagram        text,
  endereco         text,
  descricao        text,
  -- de onde vem a disponibilidade em cada vitrine
  fonte_cliente    text not null default 'estoque'    check (fonte_cliente in ('estoque','fornecedor','ambos')),
  fonte_revenda    text not null default 'fornecedor' check (fonte_revenda in ('estoque','fornecedor','ambos')),
  -- a vitrine de revenda só abre com este código no link
  token_revenda    text not null default encode(extensions.gen_random_bytes(12), 'hex'),
  publicada        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catálogo mestre de modelos (global quando empresa_id é nulo) e fotos
-- ---------------------------------------------------------------------------
create table public.cat_modelos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid references public.empresas(id) on delete cascade, -- nulo = modelo global
  marca       text not null,
  linha       text,
  nome        text not null,
  ano         int check (ano between 2000 and 2100),
  memorias    text[] not null default '{}',
  cores       text[] not null default '{}',
  apelidos    text[] not null default '{}',   -- "17pm", "17 pro max" etc. ajudam a IA
  slug        text not null check (slug ~ '^[a-z0-9-]+$'),
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index cat_modelos_slug_uq on public.cat_modelos (coalesce(empresa_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);

create table public.cat_imagens (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid references public.empresas(id) on delete cascade, -- nulo = foto global do modelo
  modelo_id   uuid not null references public.cat_modelos(id) on delete cascade,
  cor         text,                       -- nulo = vale para qualquer cor
  url         text not null,
  tipo        text not null check (tipo in ('oficial','foto_real','ilustrativa')),
  fonte       text,                       -- de onde veio (para direito de imagem)
  verificada  boolean not null default false,
  ordem       int not null default 0,
  created_at  timestamptz not null default now()
);
create index cat_imagens_modelo_idx on public.cat_imagens(modelo_id, cor);

-- ---------------------------------------------------------------------------
-- Categorias e produtos
-- ---------------------------------------------------------------------------
create table public.cat_categorias (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  nome        text not null,
  slug        text not null check (slug ~ '^[a-z0-9-]+$'),
  pai_id      uuid,
  ordem       int not null default 0,
  ativa       boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (empresa_id, slug),
  unique (id, empresa_id),
  foreign key (pai_id, empresa_id) references public.cat_categorias(id, empresa_id) on delete set null (pai_id)
);

create table public.cat_produtos (
  id                      uuid primary key default gen_random_uuid(),
  empresa_id              uuid not null references public.empresas(id) on delete cascade,
  modelo_id               uuid references public.cat_modelos(id) on delete set null,
  categoria_id            uuid,
  nome                    text not null check (length(trim(nome)) > 0),
  slug                    text not null check (slug ~ '^[a-z0-9-]+$'),
  armazenamento           text,
  cor                     text,
  condicao                text not null check (condicao in ('lacrado','seminovo','usado','cpo')),
  descricao               text,
  observacoes             text,
  status                  text not null default 'revisao' check (status in ('ativo','indisponivel','revisao','arquivado')),
  -- disponibilidade pela lista do fornecedor
  fornecedor_id           uuid references public.fornecedores(id) on delete set null,
  disponivel_fornecedor   boolean not null default false,
  fornecedor_atualizado_em timestamptz,
  -- disponibilidade pelo estoque real do CLS Control (opcional)
  produto_cls_id          uuid references public.produtos(id) on delete set null,
  -- "impressão digital" contra duplicidade
  chave                   text generated always as (
                            lower(coalesce(modelo_id::text, nome) || '|' || coalesce(armazenamento,'') || '|' ||
                                  coalesce(cor,'') || '|' || condicao)) stored,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (empresa_id, chave),
  unique (empresa_id, slug),
  unique (id, empresa_id),
  foreign key (categoria_id, empresa_id) references public.cat_categorias(id, empresa_id) on delete set null (categoria_id)
);
create index cat_produtos_status_idx on public.cat_produtos(empresa_id, status);

-- fornecedor e produto do CLS Control precisam ser da mesma loja
create or replace function public.cat_produto_valida() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.fornecedor_id is not null and not exists (
       select 1 from public.fornecedores f where f.id = new.fornecedor_id and f.empresa_id = new.empresa_id) then
    raise exception 'Fornecedor de outra loja';
  end if;
  if new.produto_cls_id is not null and not exists (
       select 1 from public.produtos p where p.id = new.produto_cls_id and p.empresa_id = new.empresa_id) then
    raise exception 'Produto do estoque de outra loja';
  end if;
  if new.modelo_id is not null and not exists (
       select 1 from public.cat_modelos m where m.id = new.modelo_id
         and (m.empresa_id is null or m.empresa_id = new.empresa_id)) then
    raise exception 'Modelo de outra loja';
  end if;
  return new;
end $$;
create trigger cat_produtos_valida before insert or update on public.cat_produtos
  for each row execute function public.cat_produto_valida();

-- ---------------------------------------------------------------------------
-- Custos (privado) e preços (públicos), separados de propósito
-- ---------------------------------------------------------------------------
create table public.cat_custos (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null,
  produto_id     uuid not null,
  fornecedor_id  uuid references public.fornecedores(id) on delete set null,
  importacao_id  uuid,
  custo          numeric(12,2) not null check (custo > 0),
  vigente_desde  timestamptz not null default now(),
  criado_por     uuid default auth.uid(),
  foreign key (produto_id, empresa_id) references public.cat_produtos(id, empresa_id) on delete cascade
);
create index cat_custos_produto_idx on public.cat_custos(produto_id, vigente_desde desc);

create table public.cat_precos (
  id                 uuid primary key default gen_random_uuid(),
  empresa_id         uuid not null,
  produto_id         uuid not null,
  canal              text not null check (canal in ('cliente','revenda')),
  preco_vista        numeric(12,2) not null check (preco_vista > 0),
  preco_promocional  numeric(12,2) check (preco_promocional > 0),
  promo_ate          timestamptz,
  origem             text not null default 'regra' check (origem in ('regra','manual')),
  updated_at         timestamptz not null default now(),
  unique (produto_id, canal),
  check (preco_promocional is null or preco_promocional < preco_vista),
  foreign key (produto_id, empresa_id) references public.cat_produtos(id, empresa_id) on delete cascade
);

create table public.cat_regras_preco (
  id               uuid primary key default gen_random_uuid(),
  empresa_id       uuid not null references public.empresas(id) on delete cascade,
  canal            text not null check (canal in ('cliente','revenda')),
  alcance          text not null check (alcance in ('geral','categoria','condicao','produto')),
  categoria_id     uuid,
  condicao         text check (condicao in ('lacrado','seminovo','usado','cpo')),
  produto_id       uuid,
  margem_pct       numeric(6,2) not null default 0 check (margem_pct >= 0),
  margem_fixa      numeric(12,2) not null default 0 check (margem_fixa >= 0),
  arredondamento   text not null default 'nenhum' check (arredondamento in ('nenhum','dezena','final_90')),
  ativa            boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check ((alcance = 'categoria') = (categoria_id is not null)),
  check ((alcance = 'condicao')  = (condicao is not null)),
  check ((alcance = 'produto')   = (produto_id is not null)),
  foreign key (categoria_id, empresa_id) references public.cat_categorias(id, empresa_id) on delete cascade,
  foreign key (produto_id, empresa_id)   references public.cat_produtos(id, empresa_id)   on delete cascade
);

create table public.cat_taxas_cartao (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  parcelas    int not null check (parcelas between 1 and 24),
  taxa_pct    numeric(6,2) not null check (taxa_pct >= 0 and taxa_pct < 100),
  unique (empresa_id, parcelas)
);

-- ---------------------------------------------------------------------------
-- Importações
-- ---------------------------------------------------------------------------
create table public.cat_importacoes (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references public.empresas(id) on delete cascade,
  fornecedor_id     uuid references public.fornecedores(id) on delete set null,
  origem            text not null check (origem in ('colar','txt','csv','xlsx')),
  arquivo_nome      text,
  texto_original    text not null,
  status            text not null default 'processando'
                    check (status in ('processando','revisao','aplicada','descartada','erro')),
  total_itens       int not null default 0,
  itens_prontos     int not null default 0,
  itens_revisar     int not null default 0,
  itens_duplicados  int not null default 0,
  erro              text,
  criado_por        uuid default auth.uid(),
  created_at        timestamptz not null default now(),
  aplicada_em       timestamptz,
  unique (id, empresa_id)
);
create index cat_importacoes_emp_idx on public.cat_importacoes(empresa_id, created_at desc);

alter table public.cat_custos
  add foreign key (importacao_id, empresa_id) references public.cat_importacoes(id, empresa_id) on delete set null (importacao_id);

create table public.cat_importacao_itens (
  id                    uuid primary key default gen_random_uuid(),
  empresa_id            uuid not null,
  importacao_id         uuid not null,
  linha_num             int not null,
  linha_original        text not null,
  dados                 jsonb not null default '{}'::jsonb,  -- o que a IA extraiu (campo ausente = null)
  confianca             numeric(3,2) check (confianca between 0 and 1),
  campos_duvidosos      text[] not null default '{}',
  status                text not null default 'revisar'
                        check (status in ('pronto','revisar','duplicado','ignorado','aplicado')),
  produto_existente_id  uuid,
  acao                  text check (acao in ('criar','atualizar','ignorar')),
  mudancas              jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  foreign key (importacao_id, empresa_id) references public.cat_importacoes(id, empresa_id) on delete cascade,
  foreign key (produto_existente_id, empresa_id) references public.cat_produtos(id, empresa_id) on delete set null (produto_existente_id)
);
create index cat_imp_itens_idx on public.cat_importacao_itens(importacao_id, status);

-- ---------------------------------------------------------------------------
-- Histórico de alterações e eventos da vitrine
-- ---------------------------------------------------------------------------
create table public.cat_historico (
  id           bigint generated always as identity primary key,
  empresa_id   uuid not null,
  tabela       text not null,
  registro_id  uuid not null,
  acao         text not null,
  antes        jsonb,
  depois       jsonb,
  usuario_id   uuid,
  created_at   timestamptz not null default now()
);
create index cat_historico_idx on public.cat_historico(empresa_id, created_at desc);

create or replace function public.cat_registra_historico() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  r jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.cat_historico (empresa_id, tabela, registro_id, acao, antes, depois, usuario_id)
  values ((r->>'empresa_id')::uuid, tg_table_name, (r->>'id')::uuid, lower(tg_op),
          case when tg_op <> 'INSERT' then to_jsonb(old) end,
          case when tg_op <> 'DELETE' then to_jsonb(new) end,
          auth.uid());
  return coalesce(new, old);
end $$;

create trigger cat_produtos_hist after insert or update or delete on public.cat_produtos
  for each row execute function public.cat_registra_historico();
create trigger cat_precos_hist after insert or update or delete on public.cat_precos
  for each row execute function public.cat_registra_historico();
create trigger cat_custos_hist after insert or update or delete on public.cat_custos
  for each row execute function public.cat_registra_historico();
create trigger cat_regras_hist after insert or update or delete on public.cat_regras_preco
  for each row execute function public.cat_registra_historico();

create table public.cat_eventos (
  id          bigint generated always as identity primary key,
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  produto_id  uuid references public.cat_produtos(id) on delete set null,
  tipo        text not null check (tipo in ('visita_vitrine','visita_produto','compartilhar','clique_whatsapp','busca')),
  canal       text not null default 'cliente' check (canal in ('cliente','revenda')),
  origem      text,       -- utm / link de campanha
  sessao      text,
  created_at  timestamptz not null default now()
);
create index cat_eventos_idx on public.cat_eventos(empresa_id, created_at desc);

-- updated_at automático
create trigger cat_membros_touch  before update on public.cat_membros       for each row execute function public.cat_touch();
create trigger cat_lojas_touch    before update on public.cat_lojas         for each row execute function public.cat_touch();
create trigger cat_modelos_touch  before update on public.cat_modelos       for each row execute function public.cat_touch();
create trigger cat_produtos_touch before update on public.cat_produtos      for each row execute function public.cat_touch();
create trigger cat_precos_touch   before update on public.cat_precos        for each row execute function public.cat_touch();
create trigger cat_regras_touch   before update on public.cat_regras_preco  for each row execute function public.cat_touch();
create trigger cat_itens_touch    before update on public.cat_importacao_itens for each row execute function public.cat_touch();

-- ---------------------------------------------------------------------------
-- Segurança (RLS). Regra geral: membro vê a própria loja; dinheiro só dono e gerente.
-- O público (anon) não tem nenhuma política: a vitrine lerá por funções próprias.
-- ---------------------------------------------------------------------------
alter table public.cat_membros          enable row level security;
alter table public.cat_lojas            enable row level security;
alter table public.cat_modelos          enable row level security;
alter table public.cat_imagens          enable row level security;
alter table public.cat_categorias       enable row level security;
alter table public.cat_produtos         enable row level security;
alter table public.cat_custos           enable row level security;
alter table public.cat_precos           enable row level security;
alter table public.cat_regras_preco     enable row level security;
alter table public.cat_taxas_cartao     enable row level security;
alter table public.cat_importacoes      enable row level security;
alter table public.cat_importacao_itens enable row level security;
alter table public.cat_historico        enable row level security;
alter table public.cat_eventos          enable row level security;

revoke all on public.cat_membros, public.cat_lojas, public.cat_modelos, public.cat_imagens,
  public.cat_categorias, public.cat_produtos, public.cat_custos, public.cat_precos,
  public.cat_regras_preco, public.cat_taxas_cartao, public.cat_importacoes,
  public.cat_importacao_itens, public.cat_historico, public.cat_eventos from anon;

-- membros: cada um vê a equipe das lojas onde está; só o dono mexe
create policy cat_membros_sel on public.cat_membros for select to authenticated
  using (user_id = auth.uid() or public.cat_membro(empresa_id));
create policy cat_membros_ins on public.cat_membros for insert to authenticated
  with check (public.cat_papel(empresa_id) = 'dono');
create policy cat_membros_upd on public.cat_membros for update to authenticated
  using (public.cat_papel(empresa_id) = 'dono' and user_id <> auth.uid())
  with check (public.cat_papel(empresa_id) = 'dono');
create policy cat_membros_del on public.cat_membros for delete to authenticated
  using (public.cat_papel(empresa_id) = 'dono' and user_id <> auth.uid());

-- loja
create policy cat_lojas_sel on public.cat_lojas for select to authenticated using (public.cat_membro(empresa_id));
create policy cat_lojas_upd on public.cat_lojas for update to authenticated
  using (public.cat_gestor(empresa_id)) with check (public.cat_gestor(empresa_id));

-- modelos e imagens: globais para leitura; os da loja, a loja edita
create policy cat_modelos_sel on public.cat_modelos for select to authenticated
  using (empresa_id is null or public.cat_membro(empresa_id));
create policy cat_modelos_ins on public.cat_modelos for insert to authenticated
  with check (empresa_id is not null and public.cat_gestor(empresa_id));
create policy cat_modelos_upd on public.cat_modelos for update to authenticated
  using (empresa_id is not null and public.cat_gestor(empresa_id))
  with check (empresa_id is not null and public.cat_gestor(empresa_id));

create policy cat_imagens_sel on public.cat_imagens for select to authenticated
  using (empresa_id is null or public.cat_membro(empresa_id));
create policy cat_imagens_ins on public.cat_imagens for insert to authenticated
  with check (empresa_id is not null and public.cat_membro(empresa_id));
create policy cat_imagens_upd on public.cat_imagens for update to authenticated
  using (empresa_id is not null and public.cat_membro(empresa_id))
  with check (empresa_id is not null and public.cat_membro(empresa_id));
create policy cat_imagens_del on public.cat_imagens for delete to authenticated
  using (empresa_id is not null and public.cat_membro(empresa_id));

-- categorias e produtos: toda a equipe
create policy cat_categorias_all on public.cat_categorias for all to authenticated
  using (public.cat_membro(empresa_id)) with check (public.cat_membro(empresa_id));
create policy cat_produtos_sel on public.cat_produtos for select to authenticated using (public.cat_membro(empresa_id));
create policy cat_produtos_ins on public.cat_produtos for insert to authenticated with check (public.cat_membro(empresa_id));
create policy cat_produtos_upd on public.cat_produtos for update to authenticated
  using (public.cat_membro(empresa_id)) with check (public.cat_membro(empresa_id));
create policy cat_produtos_del on public.cat_produtos for delete to authenticated using (public.cat_gestor(empresa_id));

-- preço público: equipe vê, gestor muda
create policy cat_precos_sel on public.cat_precos for select to authenticated using (public.cat_membro(empresa_id));
create policy cat_precos_wr on public.cat_precos for all to authenticated
  using (public.cat_gestor(empresa_id)) with check (public.cat_gestor(empresa_id));

-- custo, regras, taxas, importações, histórico, eventos: só dono e gerente
create policy cat_custos_all on public.cat_custos for all to authenticated
  using (public.cat_gestor(empresa_id)) with check (public.cat_gestor(empresa_id));
create policy cat_regras_all on public.cat_regras_preco for all to authenticated
  using (public.cat_gestor(empresa_id)) with check (public.cat_gestor(empresa_id));
create policy cat_taxas_all on public.cat_taxas_cartao for all to authenticated
  using (public.cat_gestor(empresa_id)) with check (public.cat_gestor(empresa_id));
create policy cat_importacoes_all on public.cat_importacoes for all to authenticated
  using (public.cat_gestor(empresa_id)) with check (public.cat_gestor(empresa_id));
create policy cat_imp_itens_all on public.cat_importacao_itens for all to authenticated
  using (public.cat_gestor(empresa_id)) with check (public.cat_gestor(empresa_id));
create policy cat_historico_sel on public.cat_historico for select to authenticated using (public.cat_gestor(empresa_id));
create policy cat_eventos_sel on public.cat_eventos for select to authenticated using (public.cat_gestor(empresa_id));

-- ---------------------------------------------------------------------------
-- Dados iniciais da CLS
-- ---------------------------------------------------------------------------
insert into public.cat_lojas (empresa_id, slug, nome, whatsapp, instagram)
select id, 'cls', coalesce(nome_fantasia, 'CLS Import'), null, null
from public.empresas where id = 'a0000000-0000-0000-0000-000000000001';

insert into public.cat_membros (empresa_id, user_id, papel)
select u.empresa_id, u.id,
       case u.papel when 'admin' then 'dono' when 'gerente' then 'gerente' else 'editor' end
from public.usuarios u
join auth.users a on a.id = u.id
where u.empresa_id = 'a0000000-0000-0000-0000-000000000001' and u.ativo;

insert into public.cat_categorias (empresa_id, nome, slug, ordem)
select 'a0000000-0000-0000-0000-000000000001', c.nome, c.slug, c.ordem
from (values ('iPhone','iphone',1),('Samsung','samsung',2),('Xiaomi','xiaomi',3),('Motorola','motorola',4),
             ('Realme','realme',5),('iPad','ipad',6),('MacBook','macbook',7),('Apple Watch','apple-watch',8),
             ('Acessórios','acessorios',9)) as c(nome, slug, ordem);
