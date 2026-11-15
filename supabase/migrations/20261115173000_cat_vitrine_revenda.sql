-- CLS Smart Catalog · Vitrine de revenda
-- Cada linha de cat_produtos passa a ser UMA unidade física (cor e bateria próprias).
-- O revendedor segura a unidade por alguns minutos e envia o pedido pela vitrine.
-- Só mexe em objetos cat_ e no bucket de fotos do catálogo. Nada do CLS Control muda.

-- ---------------------------------------------------------------------------
-- 1. Produto = unidade
-- ---------------------------------------------------------------------------
-- A chave deixa de ser única: dois aparelhos iguais são duas unidades.
alter table public.cat_produtos drop column chave;
alter table public.cat_produtos
  alter column condicao drop not null,          -- a lista nem sempre informa; não inventamos
  add column bateria  int check (bateria between 1 and 100),
  add column detalhe  text,                     -- "44 mm · 2ª geração", "8 GB de RAM"
  add column foto_url text,                     -- foto real desta unidade (opcional)
  add column chave    text generated always as (
    lower(coalesce(modelo_id::text, nome) || '|' || coalesce(armazenamento,'') || '|' ||
          coalesce(cor,'') || '|' || coalesce(condicao,''))) stored;
create index cat_produtos_chave_idx on public.cat_produtos (empresa_id, chave);

alter table public.cat_produtos drop constraint cat_produtos_status_check;
alter table public.cat_produtos add constraint cat_produtos_status_check
  check (status in ('ativo','indisponivel','revisao','arquivado','vendido'));

-- ---------------------------------------------------------------------------
-- 2. Loja: tempo de segurar e pontos de retirada
-- ---------------------------------------------------------------------------
alter table public.cat_lojas
  add column segura_minutos int not null default 15 check (segura_minutos between 1 and 240),
  add column retiradas text[] not null default '{}';
update public.cat_lojas set retiradas = '{Caxias,Recreio}' where slug = 'cls';

-- ---------------------------------------------------------------------------
-- 3. Pedidos da vitrine
-- ---------------------------------------------------------------------------
create table public.cat_pedidos (
  id                  uuid primary key default gen_random_uuid(),
  empresa_id          uuid not null references public.empresas(id) on delete cascade,
  numero              int not null,
  canal               text not null default 'revenda' check (canal in ('cliente','revenda')),
  comprador_nome      text not null check (length(trim(comprador_nome)) between 2 and 80),
  comprador_whatsapp  text not null check (comprador_whatsapp ~ '^[0-9]{10,13}$'),
  pagamento           text not null check (pagamento in ('pix','dinheiro','cartao','pix_cartao')),
  entrega             text not null,            -- "Entrega" ou um ponto de retirada da loja
  observacao          text,
  total               numeric(12,2) not null,
  status              text not null default 'novo' check (status in ('novo','confirmado','cancelado')),
  sessao              text,
  atendido_por        uuid references auth.users(id) on delete set null,
  atendido_em         timestamptz,
  created_at          timestamptz not null default now(),
  unique (empresa_id, numero),
  unique (id, empresa_id)
);
create index cat_pedidos_emp_idx on public.cat_pedidos (empresa_id, created_at desc);

create table public.cat_pedido_itens (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null,
  pedido_id   uuid not null,
  produto_id  uuid,
  descricao   text not null,                    -- retrato da unidade na hora do pedido
  preco       numeric(12,2) not null,
  foreign key (pedido_id, empresa_id)  references public.cat_pedidos(id, empresa_id)  on delete cascade,
  foreign key (produto_id, empresa_id) references public.cat_produtos(id, empresa_id) on delete set null (produto_id)
);
create index cat_pedido_itens_idx on public.cat_pedido_itens (pedido_id);

-- Uma unidade só pode estar segurada por uma pessoa de cada vez.
create table public.cat_reservas (
  produto_id  uuid primary key,
  empresa_id  uuid not null,
  sessao      text not null check (length(sessao) between 16 and 64),
  ate         timestamptz not null,
  pedido_id   uuid,
  created_at  timestamptz not null default now(),
  foreign key (produto_id, empresa_id) references public.cat_produtos(id, empresa_id) on delete cascade,
  foreign key (pedido_id, empresa_id)  references public.cat_pedidos(id, empresa_id)  on delete cascade
);
create index cat_reservas_sessao_idx on public.cat_reservas (empresa_id, sessao);

alter table public.cat_pedidos      enable row level security;
alter table public.cat_pedido_itens enable row level security;
alter table public.cat_reservas     enable row level security;
revoke all on public.cat_pedidos, public.cat_pedido_itens, public.cat_reservas from anon;

-- A equipe só lê; quem escreve são as funções abaixo.
create policy cat_pedidos_sel      on public.cat_pedidos      for select to authenticated using (public.cat_membro(empresa_id));
create policy cat_pedido_itens_sel on public.cat_pedido_itens for select to authenticated using (public.cat_membro(empresa_id));
create policy cat_reservas_sel     on public.cat_reservas     for select to authenticated using (public.cat_membro(empresa_id));

-- ---------------------------------------------------------------------------
-- 4. Funções públicas da vitrine de revenda (só abrem com o código do link)
--    Nunca devolvem custo.
-- ---------------------------------------------------------------------------
create or replace function public.cat_revenda_vitrine(p_token text, p_sessao text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  l public.cat_lojas;
begin
  select * into l from public.cat_lojas where token_revenda = p_token;
  if not found then return null; end if;

  return jsonb_build_object(
    'loja', jsonb_build_object('nome', l.nome, 'whatsapp', l.whatsapp,
                               'segura_minutos', l.segura_minutos, 'retiradas', to_jsonb(l.retiradas)),
    'agora', now(),
    'itens', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', p.id, 'nome', p.nome, 'armazenamento', p.armazenamento, 'detalhe', p.detalhe,
               'cor', p.cor, 'condicao', p.condicao, 'bateria', p.bateria, 'foto', p.foto_url,
               'categoria', c.slug, 'categoria_nome', c.nome,
               'preco', case when pr.preco_promocional is not null and (pr.promo_ate is null or pr.promo_ate > now())
                             then pr.preco_promocional else pr.preco_vista end,
               'preco_de', case when pr.preco_promocional is not null and (pr.promo_ate is null or pr.promo_ate > now())
                                then pr.preco_vista end,
               'estado', case when r.produto_id is null then 'livre'
                              when r.sessao = p_sessao and r.pedido_id is not null then 'pedido'
                              when r.sessao = p_sessao then 'meu'
                              else 'segurado' end,
               'ate', r.ate)
             order by coalesce(c.ordem, 999), pr.preco_vista, p.nome, p.bateria desc nulls last)
      from public.cat_produtos p
      join public.cat_precos pr on pr.produto_id = p.id and pr.canal = 'revenda'
      left join public.cat_categorias c on c.id = p.categoria_id
      left join public.cat_reservas r on r.produto_id = p.id and r.ate > now()
      where p.empresa_id = l.empresa_id and p.status = 'ativo'), '[]'::jsonb));
end $$;

create or replace function public.cat_revenda_segurar(p_token text, p_sessao text, p_produto uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  l public.cat_lojas;
  v_ate timestamptz;
begin
  select * into l from public.cat_lojas where token_revenda = p_token;
  if not found or p_sessao is null or length(p_sessao) not between 16 and 64 then
    return jsonb_build_object('ok', false, 'motivo', 'link');
  end if;
  if not exists (select 1 from public.cat_produtos p
                 join public.cat_precos pr on pr.produto_id = p.id and pr.canal = 'revenda'
                 where p.id = p_produto and p.empresa_id = l.empresa_id and p.status = 'ativo') then
    return jsonb_build_object('ok', false, 'motivo', 'indisponivel');
  end if;
  -- ninguém segura a vitrine inteira
  if (select count(*) from public.cat_reservas
      where empresa_id = l.empresa_id and sessao = p_sessao and ate > now()
        and pedido_id is null and produto_id <> p_produto) >= 8 then
    return jsonb_build_object('ok', false, 'motivo', 'limite');
  end if;

  insert into public.cat_reservas as r (produto_id, empresa_id, sessao, ate)
  values (p_produto, l.empresa_id, p_sessao, now() + make_interval(mins => l.segura_minutos))
  on conflict (produto_id) do update
    set sessao = excluded.sessao, pedido_id = null,
        ate = case when r.sessao = excluded.sessao and r.ate > now() then r.ate else excluded.ate end
    where r.ate <= now() or (r.sessao = excluded.sessao and r.pedido_id is null)
  returning r.ate into v_ate;

  if v_ate is null then return jsonb_build_object('ok', false, 'motivo', 'segurado'); end if;
  return jsonb_build_object('ok', true, 'ate', v_ate);
end $$;

create or replace function public.cat_revenda_soltar(p_token text, p_sessao text, p_produto uuid)
returns boolean language sql security definer set search_path = public as $$
  with apagada as (
    delete from public.cat_reservas r using public.cat_lojas l
    where l.token_revenda = p_token and r.empresa_id = l.empresa_id
      and r.produto_id = p_produto and r.sessao = p_sessao and r.pedido_id is null
    returning 1)
  select exists (select 1 from apagada);
$$;

create or replace function public.cat_revenda_pedir(
  p_token text, p_sessao text, p_nome text, p_whatsapp text,
  p_pagamento text, p_entrega text, p_obs text, p_produtos uuid[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  l public.cat_lojas;
  v_pedidos uuid[] := array(select distinct x from unnest(p_produtos) x);
  v_ids uuid[];
  v_ocupados uuid[];
  v_pedido uuid;
  v_numero int;
  v_total numeric(12,2);
  v_ate timestamptz;
  v_nome text := trim(coalesce(p_nome, ''));
  v_zap text := regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g');
begin
  select * into l from public.cat_lojas where token_revenda = p_token;
  if not found or p_sessao is null or length(p_sessao) not between 16 and 64 then
    return jsonb_build_object('ok', false, 'motivo', 'link');
  end if;
  if length(v_nome) not between 2 and 80 or v_zap !~ '^[0-9]{10,13}$'
     or p_pagamento is null or p_pagamento not in ('pix','dinheiro','cartao','pix_cartao')
     or p_entrega is null or not (p_entrega = 'Entrega' or p_entrega = any(l.retiradas))
     or coalesce(array_length(v_pedidos, 1), 0) not between 1 and 8 then
    return jsonb_build_object('ok', false, 'motivo', 'dados');
  end if;
  if (select count(*) from public.cat_pedidos
      where empresa_id = l.empresa_id and sessao = p_sessao and created_at > now() - interval '1 hour') >= 5 then
    return jsonb_build_object('ok', false, 'motivo', 'limite');
  end if;

  -- trava as unidades: dois pedidos ao mesmo tempo entram em fila aqui
  perform 1 from public.cat_produtos p
   where p.id = any(v_pedidos) and p.empresa_id = l.empresa_id order by p.id for update;

  select array_agg(p.id) into v_ids from public.cat_produtos p
   where p.id = any(v_pedidos) and p.empresa_id = l.empresa_id and p.status = 'ativo'
     and exists (select 1 from public.cat_precos pr where pr.produto_id = p.id and pr.canal = 'revenda');

  select array_agg(x) into v_ocupados from unnest(v_pedidos) x
   where not (x = any(coalesce(v_ids, '{}')))
      or exists (select 1 from public.cat_reservas r
                 where r.produto_id = x and r.ate > now()
                   and (r.sessao <> p_sessao or r.pedido_id is not null));
  if v_ocupados is not null then
    return jsonb_build_object('ok', false, 'motivo', 'ocupado', 'ids', to_jsonb(v_ocupados));
  end if;

  perform pg_advisory_xact_lock(hashtextextended('cat_pedido:' || l.empresa_id::text, 0));
  select coalesce(max(numero), 0) + 1 into v_numero from public.cat_pedidos where empresa_id = l.empresa_id;

  insert into public.cat_pedidos (empresa_id, numero, comprador_nome, comprador_whatsapp,
                                  pagamento, entrega, observacao, total, sessao)
  values (l.empresa_id, v_numero, v_nome, v_zap, p_pagamento, p_entrega,
          nullif(trim(left(coalesce(p_obs, ''), 500)), ''), 0, p_sessao)
  returning id into v_pedido;

  insert into public.cat_pedido_itens (empresa_id, pedido_id, produto_id, descricao, preco)
  select l.empresa_id, v_pedido, p.id,
         concat_ws(' · ', p.nome, p.armazenamento, p.detalhe, p.cor,
                   case when p.bateria is not null then p.bateria || '% de bateria' end,
                   case p.condicao when 'cpo' then 'CPO' else p.condicao end),
         case when pr.preco_promocional is not null and (pr.promo_ate is null or pr.promo_ate > now())
              then pr.preco_promocional else pr.preco_vista end
  from public.cat_produtos p
  join public.cat_precos pr on pr.produto_id = p.id and pr.canal = 'revenda'
  where p.id = any(v_ids);

  update public.cat_pedidos
     set total = (select sum(preco) from public.cat_pedido_itens where pedido_id = v_pedido)
   where id = v_pedido
  returning total into v_total;

  v_ate := now() + make_interval(mins => l.segura_minutos);
  insert into public.cat_reservas (produto_id, empresa_id, sessao, ate, pedido_id)
  select x, l.empresa_id, p_sessao, v_ate, v_pedido from unnest(v_ids) x
  on conflict (produto_id) do update
    set sessao = excluded.sessao, ate = excluded.ate, pedido_id = excluded.pedido_id;

  return jsonb_build_object('ok', true, 'numero', v_numero, 'total', v_total, 'ate', v_ate);
end $$;

-- ---------------------------------------------------------------------------
-- 5. Painel: o vendedor confirma ou cancela o pedido
-- ---------------------------------------------------------------------------
create or replace function public.cat_pedido_resolver(p_pedido uuid, p_acao text)
returns text language plpgsql security definer set search_path = public as $$
declare
  ped public.cat_pedidos;
  v_conflito text;
begin
  select * into ped from public.cat_pedidos where id = p_pedido for update;
  if not found or not public.cat_membro(ped.empresa_id) then
    raise exception 'Pedido não encontrado';
  end if;
  if ped.status <> 'novo' then
    raise exception 'Este pedido já foi resolvido';
  end if;

  if p_acao = 'confirmar' then
    select string_agg(i.descricao, '; ') into v_conflito
    from public.cat_pedido_itens i
    left join public.cat_produtos p on p.id = i.produto_id
    where i.pedido_id = p_pedido and (p.id is null or p.status <> 'ativo');
    if v_conflito is not null then
      raise exception 'Não está mais disponível: %', v_conflito;
    end if;

    update public.cat_produtos set status = 'vendido'
     where id in (select produto_id from public.cat_pedido_itens where pedido_id = p_pedido);
    delete from public.cat_reservas
     where produto_id in (select produto_id from public.cat_pedido_itens where pedido_id = p_pedido);
    update public.cat_pedidos set status = 'confirmado', atendido_por = auth.uid(), atendido_em = now()
     where id = p_pedido;
  elsif p_acao = 'cancelar' then
    delete from public.cat_reservas where pedido_id = p_pedido;
    update public.cat_pedidos set status = 'cancelado', atendido_por = auth.uid(), atendido_em = now()
     where id = p_pedido;
  else
    raise exception 'Ação inválida';
  end if;
  return p_acao;
end $$;

revoke all on function public.cat_revenda_vitrine(text, text), public.cat_revenda_segurar(text, text, uuid),
  public.cat_revenda_soltar(text, text, uuid),
  public.cat_revenda_pedir(text, text, text, text, text, text, text, uuid[]) from public;
grant execute on function public.cat_revenda_vitrine(text, text), public.cat_revenda_segurar(text, text, uuid),
  public.cat_revenda_soltar(text, text, uuid),
  public.cat_revenda_pedir(text, text, text, text, text, text, text, uuid[]) to anon, authenticated;

revoke all on function public.cat_pedido_resolver(uuid, text) from public, anon;
grant execute on function public.cat_pedido_resolver(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Fotos reais das unidades: pasta pública, cada loja escreve só na própria pasta
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cat-fotos', 'cat-fotos', true, 5242880, '{image/jpeg,image/png,image/webp}')
on conflict (id) do nothing;

create policy cat_fotos_ins on storage.objects for insert to authenticated
  with check (bucket_id = 'cat-fotos' and public.cat_membro(((storage.foldername(name))[1])::uuid));
create policy cat_fotos_upd on storage.objects for update to authenticated
  using (bucket_id = 'cat-fotos' and public.cat_membro(((storage.foldername(name))[1])::uuid))
  with check (bucket_id = 'cat-fotos' and public.cat_membro(((storage.foldername(name))[1])::uuid));
create policy cat_fotos_del on storage.objects for delete to authenticated
  using (bucket_id = 'cat-fotos' and public.cat_membro(((storage.foldername(name))[1])::uuid));
