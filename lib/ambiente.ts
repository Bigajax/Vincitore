/**
 * Espelho de `usandoSupabase()` que pode rodar no cliente.
 *
 * As variáveis `NEXT_PUBLIC_*` são inlinadas no bundle em tempo de build, então
 * a leitura precisa ser literal — `process.env[chave]` não funcionaria aqui.
 */
export function usandoSupabaseCliente(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
