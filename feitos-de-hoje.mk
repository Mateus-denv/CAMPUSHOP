# Feitos de hoje

- **Texto do botão:** Troca de "Finalizar Pedido" para "Confirmar Pedido".
- **UI — Visão Geral:** Removidos cards de métricas sem lógica consolidada; removida a área "Atividade recente" e o botão "Ver meus pedidos".
- **Banco / Schema (pedido):** Criada tabela `pedido` com constraints de `status` e `chave_entrega`; trigger para geração automática de chave; adicionados `id_vendedor` em `pedido` e `id_usuario` (dono) em `produto`; atualizados scripts SQL (seed, validação, rollback).
- **Backend — Entidade Pedido:** Implementada entidade `Pedido` para mapear o novo schema.
- **Carrinho — persistência e validação:** Carrinho agora persiste no banco (nova tabela de carrinho); inclusão/atualização de itens via API do backend; validação de quantidade (não pode ser zero nem ultrapassar estoque).
- **Alerta de estoque:** Interface mostra alerta de estoque baixo quando ≤10 unidades e destaque especial quando resta 1 unidade.
- **Fluxo de pedidos:** Adicionados `PedidoItem`, serviços e controller para persistir pedidos; lógica de aceitação (decremento de estoque) e rejeição automática ("Fora de estoque"); frontend atualizado para usar API de pedidos e novas views de pedidos/conta.
- **Código de acesso & datas:** Geração de `chave_entrega` apenas após vendedor aceitar; validação do `codigoAcesso` na entrega; registro de `data_aprovacao` e `data_entrega`; DTOs e API atualizados; frontend mostra código só ao comprador; vendedor usa botão "Entregar produto".
- **Prazos e invalidação automática:** Adicionado prazo de 15 dias a partir da aprovação; registrados `prazoEntregaLimite` e `invalidadoEm`; implementação de invalidação automática de pedidos que ultrapassarem o prazo; bloqueio de confirmação de entrega para pedidos inválidos; `status_pedido` atualizado para incluir `invalido`; API expõe `prazoEntregaLimite` e `invalidadoEm`.
- **Notificações & UI de prazo:** Frontend ajustado para avisar 2 dias antes, no dia e à expiração; exibe prazo limite no detalhe do pedido; mostra aviso em `PedidosPage` e `ContaPage`.
- **Operacional:** Removida dependência do trigger de banco em tempo de execução (trigger removido em instância ativa).
- **Documentação:** Atualizada documentação do projeto para refletir as alterações.

---

*Arquivo gerado automaticamente pela ferramenta de suporte.*
