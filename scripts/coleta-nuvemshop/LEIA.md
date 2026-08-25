# Coleta do catálogo (uso único — não re-rodar sem auditar)

Scripts que trouxeram o catálogo da loja Nuvemshop do cliente
(`usevincitore.com.br`) para `data/seed.ts` e `public/fotos/`, em 25/08/2026.

Estão versionados só como registro da origem dos dados. **Re-rodar sobrescreve
`data/seed.ts` e as fotos**, e o lojista já pode ter editado tudo pelo painel.

| Script | O que faz |
|---|---|
| `coletar.mjs` | Varre a loja e monta `_nuvem/catalogo.json` (nome, preços, fotos) |
| `baixar.mjs` | Baixa as fotos em 1024×1280 para `_nuvem/fotos/` |
| `gerar-seed.mjs` | Cruza o catálogo com a ficha editorial e reescreve `data/seed.ts` |

## As três armadilhas (todas custaram um ciclo)

1. **Produtos relacionados.** A página de produto renderiza o carrossel de
   vizinhos. Pegar toda URL de `/products/` traz as fotos das outras peças — o
   Sapato Social ficou com 9 fotos das quais 7 eram de outros produtos. A âncora
   correta é o container `data-store="product-image-<LS.product.id>"`, cortado no
   **próximo** `data-store="product-`.
2. **Slugs repetidos.** A loja tem `camisa-fibra-de-bambu` duas vezes (e mais
   dois casos). Nomear o arquivo sem o hash do slug faz um sobrescrever o outro:
   62 referências viravam 53 arquivos.
3. **Preço.** O `price` do JSON-LD é o de lista. O correto é `price_number`
   (venda) e `compare_at_price_number` (riscado), ambos em `LS.variants`.

Sempre auditar com folha de contato depois de qualquer lote novo de imagens.
