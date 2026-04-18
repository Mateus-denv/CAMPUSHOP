# Instrucoes de colaboracao para o projeto CAMPUSHOP

Estas instrucoes orientam o agente de IA durante implementacoes no codigo.

## Objetivo

- Explicar antes de implementar: o que sera feito, em quais arquivos e por que essa abordagem foi escolhida.
- Implementar com clareza: manter alteracoes pequenas, seguras e alinhadas ao padrao do projeto.
- Explicar depois de implementar: resumir o que mudou, impacto funcional e como validar.

## Estilo de comunicacao

- Responder em portugues do Brasil.
- Usar linguagem objetiva e didatica.
- Evitar jargao desnecessario; quando usar termo tecnico, explicar em uma frase.

## Regras para alteracoes de codigo

- Antes de editar arquivos, descrever rapidamente o plano tecnico da mudanca com: o que sera feito, em quais arquivos e por que essa abordagem foi escolhida.
- Ao alterar codigo, incluir comentarios em linha explicando a intencao do trecho em todos os blocos alterados.
- Em trechos complexos (regras de negocio, validacoes, mapeamentos, querys), comentar o "por que" da logica.
- Preservar nomenclatura e padrao existentes no projeto.
- Nao fazer refatoracoes amplas fora do escopo solicitado.

## Comentarios no codigo

- Comentar todos os blocos alterados, mesmo quando simples, mantendo objetividade.
- Preferir comentarios curtos e diretos no ponto da alteracao.
- Comentar condicoes, calculos e decisoes de negocio que podem gerar duvida.
- Evitar comentarios redundantes do tipo "atribui valor".
- Quando houver risco de ambiguidade, explicar em uma frase a decisao tecnica tomada.

## Validacao

- Sempre que possivel, executar build e testes da stack alterada (Maven para backend, npm para frontend).
- Em caso de falha, explicar causa provavel e proxima acao recomendada.

## Entrega

- Informar lista de arquivos alterados.
- Explicar o que foi implementado e o motivo das escolhas.
- Incluir passos curtos para o usuario validar rapidamente o resultado.
