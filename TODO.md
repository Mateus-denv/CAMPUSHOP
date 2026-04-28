# Plano de Correção - CampuShop

## Problemas Críticos Identificados

1. **ProdutoController.java** - Conflitos de merge (<<<<<<< Updated upstream) + imports faltando
2. **ProdutoRepository.java** - Faltam imports @Query e @Param
3. **frontend/src/lib/geolocation.ts** - URL com `:` em vez de `,` + comparação "ok" minúsculo
4. **frontend/src/pages/HomePage.tsx** - Função obterEndereco duplicada localmente
5. **db/scripts/001_schema.sql** - Falta coluna id_usuario e FK na tabela produto
6. **AuthController.java** - Imports na mesma linha (formatação)

## Checklist de Correções

- [x] 1. Corrigir ProdutoController.java (resolver conflitos, adicionar imports, usar ProdutoService)
- [x] 2. Corrigir ProdutoRepository.java (adicionar @Query e @Param imports)
- [x] 3. Corrigir geolocation.ts (URL e comparação de status)
- [x] 4. Refatorar HomePage.tsx (remover obterEndereco duplicado, importar do geolocation.ts)
- [x] 5. Corrigir 001_schema.sql (adicionar id_usuario e FK)
- [ ] 6. Formatar AuthController.java (imports separados)
- [ ] 7. Testar compilação do backend
- [ ] 8. Testar build do frontend

