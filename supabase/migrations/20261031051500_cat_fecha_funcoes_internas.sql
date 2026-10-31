-- Funções de gatilho não devem ser chamáveis pela API.
revoke all on function public.cat_produto_valida(), public.cat_registra_historico(), public.cat_touch() from public, anon, authenticated;
