package br.com.campushop.campushop_backend.service;

import java.util.Objects;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import br.com.campushop.campushop_backend.validation.UsuarioValidator;

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioValidator usuarioValidator;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
            UsuarioValidator usuarioValidator) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.usuarioValidator = usuarioValidator;
    }

    public Usuario salvar(Usuario usuario) {
        logger.info("Tentando salvar usuário com email: {}", usuario.getEmail());

        // Validações
        usuarioValidator.validarUsuario(
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                usuario.getCpfCnpj(),
                usuario.getDataNascimento(),
                usuario.getRa());

        // normalização
        usuario.setEmail(usuario.getEmail().trim().toLowerCase());
        usuario.setRa(usuario.getRa().trim());

        // regra de negócio (aqui sim!)
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }

        if (usuarioRepository.existsByRa(usuario.getRa())) {
            throw new RuntimeException("RA já cadastrado");
        }

        // criptografia
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));

        Usuario salvo = usuarioRepository.save(usuario);

        logger.info("Usuário salvo com sucesso! ID: {}", salvo.getId());

        return salvo;
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public boolean autenticar(String email, String senha) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        return usuarioOpt.map(usuario -> {
            String senhaSalva = usuario.getSenha();

            if (senhaSalva == null) {
                return false;
            }

            if (senhaSalva.startsWith("$2a$") || senhaSalva.startsWith("$2b$") || senhaSalva.startsWith("$2y$")) {
                return passwordEncoder.matches(senha, senhaSalva);
            }

            return senhaSalva.equals(senha);
        }).orElse(false);
    }

    public boolean emailJaCadastrado(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    public boolean raJaCadastrado(String ra) {
        return usuarioRepository.existsByRa(ra);
    }

    public Usuario atualizarPerfil(String emailAutenticado, String nomeCompleto, String email) {
        // Busca o usuário a partir do email do token para garantir que só atualize o
        // próprio perfil.
        Usuario usuario = usuarioRepository.findByEmail(emailAutenticado)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        String nomeNormalizado = nomeCompleto != null ? nomeCompleto.trim() : "";
        String emailNormalizado = email != null ? email.trim().toLowerCase() : "";

        // Reutiliza validações de domínio já existentes para evitar regras duplicadas.
        usuarioValidator.validarNomeCompleto(nomeNormalizado);
        usuarioValidator.validarEmail(emailNormalizado);

        // Bloqueia troca para um email que já pertence a outro usuário.
        if (!usuario.getEmail().equalsIgnoreCase(emailNormalizado)
                && usuarioRepository.existsByEmail(emailNormalizado)) {
            throw new RuntimeException("Email já cadastrado");
        }

        // Mantém nome de perfil e nomeCliente sincronizados para evitar divergência em
        // consultas futuras.
        usuario.setNomeCompleto(nomeNormalizado);
        usuario.setNomeCliente(nomeNormalizado);
        usuario.setEmail(emailNormalizado);

        return usuarioRepository.save(usuario);
    }

    public void excluirUsuario(Integer id) {
        Integer usuarioId = Objects.requireNonNull(id, "ID do usuário não pode ser nulo");
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            usuario.setAtivado(false);
            usuarioRepository.save(usuario);
            logger.info("Usuário desativado com sucesso! ID: {}", usuarioId);
        } else {
            throw new RuntimeException("Usuário não encontrado");
        }
    }

    // Busca usuário por ID (usado pelo frontend para exibir dados públicos do
    // vendedor)
    public Optional<Usuario> buscarPorId(Integer id) {
        Integer usuarioId = Objects.requireNonNull(id, "ID do usuário não pode ser nulo");
        return usuarioRepository.findById(usuarioId);
    }

    /**
     * Atualiza os campos de localização do usuário identificado pelo email.
     * Mantém a lógica de domínio no service e salva a última data de atualização.
     */
    public Usuario atualizarLocalizacao(String emailAutenticado,
            Double latitude,
            Double longitude,
            String cidade,
            String estado,
            String cep,
            String endereco) {

        Usuario usuario = usuarioRepository.findByEmail(emailAutenticado)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setLatitude(latitude);
        usuario.setLongitude(longitude);
        if (cidade != null)
            usuario.setCidade(cidade);
        if (estado != null)
            usuario.setEstado(estado);
        if (cep != null)
            usuario.setCep(cep);
        if (endereco != null)
            usuario.setEndereco(endereco);
        usuario.setUltimaAtualizacaoLocalizacao(java.time.LocalDateTime.now());

        return usuarioRepository.save(usuario);
    }

}
