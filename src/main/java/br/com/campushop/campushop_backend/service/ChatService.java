package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.dto.ChatMensagemResponse;
import br.com.campushop.campushop_backend.dto.ChatPedidoResponse;
import br.com.campushop.campushop_backend.model.ChatMensagem;
import br.com.campushop.campushop_backend.model.Pedido;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.ChatMensagemRepository;
import br.com.campushop.campushop_backend.repository.PedidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static java.util.Locale.ROOT;

@Service
public class ChatService {

    private final ChatMensagemRepository chatMensagemRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioService usuarioService;

    public ChatService(ChatMensagemRepository chatMensagemRepository,
            PedidoRepository pedidoRepository,
            UsuarioService usuarioService) {
        this.chatMensagemRepository = chatMensagemRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public List<ChatPedidoResponse> listarPedidosParaChat(String emailUsuario) {
        Usuario usuarioLogado = usuarioService.buscarPorEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<ChatPedidoResponse> pedidos = new ArrayList<>();

        pedidoRepository.findByCompradorEmail(emailUsuario).forEach(pedido ->
                pedidos.add(toChatPedidoResponse(pedido, usuarioLogado, false)));

        pedidoRepository.findByVendedorEmail(emailUsuario).forEach(pedido ->
                pedidos.add(toChatPedidoResponse(pedido, usuarioLogado, true)));

        return pedidos;
    }

    @Transactional(readOnly = true)
    public List<ChatMensagemResponse> listarMensagensDoPedido(Integer pedidoId, String emailUsuario) {
        Pedido pedido = verificarPedidoDoUsuario(pedidoId, emailUsuario);

        return chatMensagemRepository.findByPedido_IdPedidoOrderByCriadoEmAsc(pedidoId).stream()
                .map(this::toChatMensagemResponse)
                .toList();
    }

    @Transactional
    public ChatMensagemResponse enviarMensagem(Integer pedidoId, String emailUsuario, String texto, Boolean aceitouAviso) {
        Pedido pedido = verificarPedidoDoUsuario(pedidoId, emailUsuario);
        validarChatDisponivel(pedido, aceitouAviso);

        Usuario usuarioRemetente = usuarioService.buscarPorEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        ChatMensagem mensagem = new ChatMensagem();
        mensagem.setPedido(pedido);
        mensagem.setUsuario(usuarioRemetente);
        mensagem.setTexto(texto);
        mensagem.setCriadoEm(LocalDateTime.now());

        ChatMensagem salvo = chatMensagemRepository.save(mensagem);
        return toChatMensagemResponse(salvo);
    }

    private Pedido verificarPedidoDoUsuario(Integer pedidoId, String emailUsuario) {
        Pedido pedido = pedidoRepository.findDetalhadoById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        String compradorEmail = pedido.getUsuario() != null ? pedido.getUsuario().getEmail() : null;
        String vendedorEmail = pedido.getVendedor() != null ? pedido.getVendedor().getEmail() : null;

        if (!emailUsuario.equalsIgnoreCase(compradorEmail) && !emailUsuario.equalsIgnoreCase(vendedorEmail)) {
            throw new RuntimeException("Acesso ao chat não autorizado para este pedido");
        }

        return pedido;
    }

    private void validarChatDisponivel(Pedido pedido, Boolean aceitouAviso) {
        String status = pedido.getStatusPedido();
        if (status == null) {
            return;
        }

        String statusNormalizado = status.trim().toLowerCase(ROOT);
        if ("rejeitado".equals(statusNormalizado) || "invalido".equals(statusNormalizado) || "entregue".equals(statusNormalizado)) {
            throw new RuntimeException("O chat para este pedido não está disponível porque o pedido foi rejeitado, invalidado ou já foi entregue.");
        }

        if (!"aceito".equals(statusNormalizado)) {
            throw new RuntimeException("O chat para este pedido ainda não foi liberado. Aguarde a aprovação do vendedor.");
        }

        if (aceitouAviso == null || !aceitouAviso) {
            throw new RuntimeException("É necessário confirmar que seguirá as orientações de segurança clicando em OK no aviso antes de enviar mensagens.");
        }
    }

    private ChatPedidoResponse toChatPedidoResponse(Pedido pedido, Usuario usuarioLogado, boolean souVendedor) {
        Usuario parceiro = souVendedor ? pedido.getUsuario() : pedido.getVendedor();
        String produtoNome = pedido.getItens().stream()
                .findFirst()
                .map(item -> item.getProduto() != null ? item.getProduto().getNomeProduto() : null)
                .orElse("Pedido sem produto");

        List<ChatMensagem> mensagensPedido = chatMensagemRepository
                .findByPedido_IdPedidoOrderByCriadoEmAsc(pedido.getIdPedido());
        ChatMensagem ultimaMensagem = mensagensPedido.isEmpty() ? null : mensagensPedido.get(mensagensPedido.size() - 1);

        return new ChatPedidoResponse(
                pedido.getIdPedido(),
                pedido.getStatusPedido(),
                parceiro != null ? parceiro.getId() : null,
                parceiro != null ? parceiro.getNomeCompleto() : "Usuário",
                parceiro != null ? parceiro.getTipoConta() : "",
                produtoNome,
                souVendedor,
                pedido.getDataPedido() != null ? pedido.getDataPedido().toString() : null,
                ultimaMensagem != null ? ultimaMensagem.getTexto() : null,
                ultimaMensagem != null && ultimaMensagem.getCriadoEm() != null ? ultimaMensagem.getCriadoEm().toString() : null);
    }

    private ChatMensagemResponse toChatMensagemResponse(ChatMensagem mensagem) {
        return new ChatMensagemResponse(
                mensagem.getIdChatMensagem(),
                mensagem.getPedido() != null ? mensagem.getPedido().getIdPedido() : null,
                mensagem.getUsuario() != null ? mensagem.getUsuario().getId() : null,
                mensagem.getUsuario() != null ? mensagem.getUsuario().getNomeCompleto() : null,
                mensagem.getUsuario() != null ? mensagem.getUsuario().getTipoConta() : null,
                mensagem.getTexto(),
                mensagem.getCriadoEm() != null ? mensagem.getCriadoEm().toString() : null);
    }
}
