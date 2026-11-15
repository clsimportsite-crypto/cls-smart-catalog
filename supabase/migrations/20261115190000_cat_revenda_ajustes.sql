-- CLS Smart Catalog · ajustes da auditoria de 15/11
-- 1. Aparelho com pedido pendente fica fora de alcance até a loja confirmar ou cancelar
--    (antes voltava à vitrine depois do prazo e podia entrar em dois pedidos).
-- 2. O mesmo navegador não segura o mesmo aparelho mais de 2 vezes em 2 horas
--    (antes soltar e pegar de novo renovava o prazo sem limite).

create table public.cat_reservas_log (
  id          bigint generated always as identity primary key,
  produto_id  uuid not null,
  sessao      text not null,
  created_at  timestamptz not null default now()
);
create index cat_reservas_log_idx on public.cat_reservas_log (produto_id, sessao, created_at desc);
alter table public.cat_reservas_log enable row level security;
revoke all on public.cat_reservas_log from anon, authenticated;

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
               -- prazo vencido com pedido pendente: sem relógio, espera a loja
               'ate', case when r.ate > now() then r.ate end)
             order by coalesce(c.ordem, 999), pr.preco_vista, p.nome, p.bateria desc nulls last)
      from public.cat_produtos p
      join public.cat_precos pr on pr.produto_id = p.id and pr.canal = 'revenda'
      left join public.cat_categorias c on c.id = p.categoria_id
      left join public.cat_reservas r on r.produto_id = p.id and (r.ate > now() or r.pedido_id is not null)
      where p.empresa_id = l.empresa_id and p.status = 'ativo'), '[]'::jsonb));
end $$;

create or replace function public.cat_revenda_segurar(p_token text, p_sessao text, p_produto uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  l public.cat_lojas;
  v_ate timestamptz;
  v_ja_meu boolean;
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

  select exists (select 1 from public.cat_reservas
                 where produto_id = p_produto and sessao = p_sessao and ate > now() and pedido_id is null)
    into v_ja_meu;
  if not v_ja_meu then
    if (select count(*) from public.cat_reservas
        where empresa_id = l.empresa_id and sessao = p_sessao and ate > now() and pedido_id is null) >= 8 then
      return jsonb_build_object('ok', false, 'motivo', 'limite');
    end if;
    if (select count(*) from public.cat_reservas_log
        where produto_id = p_produto and sessao = p_sessao and created_at > now() - interval '2 hours') >= 2 then
      return jsonb_build_object('ok', false, 'motivo', 'repetido');
    end if;
  end if;

  insert into public.cat_reservas as r (produto_id, empresa_id, sessao, ate)
  values (p_produto, l.empresa_id, p_sessao, now() + make_interval(mins => l.segura_minutos))
  on conflict (produto_id) do update
    set sessao = excluded.sessao,
        ate = case when r.sessao = excluded.sessao and r.ate > now() then r.ate else excluded.ate end
    where r.pedido_id is null and (r.ate <= now() or r.sessao = excluded.sessao)
  returning r.ate into v_ate;

  if v_ate is null then return jsonb_build_object('ok', false, 'motivo', 'segurado'); end if;
  if not v_ja_meu then
    insert into public.cat_reservas_log (produto_id, sessao) values (p_produto, p_sessao);
  end if;
  return jsonb_build_object('ok', true, 'ate', v_ate);
end $$;

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

  perform 1 from public.cat_produtos p
   where p.id = any(v_pedidos) and p.empresa_id = l.empresa_id order by p.id for update;

  select array_agg(p.id) into v_ids from public.cat_produtos p
   where p.id = any(v_pedidos) and p.empresa_id = l.empresa_id and p.status = 'ativo'
     and exists (select 1 from public.cat_precos pr where pr.produto_id = p.id and pr.canal = 'revenda');

  -- ocupado: já está em algum pedido pendente, ou outro revendedor está segurando agora
  select array_agg(x) into v_ocupados from unnest(v_pedidos) x
   where not (x = any(coalesce(v_ids, '{}')))
      or exists (select 1 from public.cat_reservas r
                 where r.produto_id = x
                   and (r.pedido_id is not null or (r.ate > now() and r.sessao <> p_sessao)));
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
