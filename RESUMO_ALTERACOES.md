# Resumo das Alterações

## Descrição

Foram feitas melhorias na página inicial e no layout global do CampusShop para alinhar o visual com a referência enviada, mantendo a aplicação funcional e validada com build e Docker.

## O que foi feito

- Ajuste completo da `HomePage` para combinar com a imagem de referência.
- Destaque do dia reposicionado com os indicadores de categorias, resposta média e campus local.
- Adição da seção "Outros produtos em destaque" com dois itens clicáveis.
- Troca da tipografia para `Poppins` no projeto e aplicação da fonte personalizada no título principal.
- Ajuste do gradiente principal para o azul `rgb(31, 77, 215)`.
- Criação de um rodapé global para aparecer em todas as páginas com links de contato, redes sociais, suporte e links úteis.
- Validação da aplicação com `npm run build` e rebuild dos containers Docker.

## Arquivos principais alterados

- `frontend/src/pages/HomePage.tsx`
- `frontend/src/components/Layout.tsx`
- `frontend/src/index.css`

## Observação

A fonte personalizada `Alliance No 1 ExtraBold` ficou preparada no CSS, mas depende do arquivo de fonte local em `frontend/src/assets/fonts/AllianceNo1-ExtraBold.woff2` para aparecer exatamente como na referência.
