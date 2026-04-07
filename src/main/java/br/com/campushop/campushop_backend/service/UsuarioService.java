package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario salvar(Usuario usuario) {
        logger.info("Tentando salvar usuário com email: {}", usuario.getEmail());

        // Validar campos obrigatórios
        if (usuario.getNomeCompleto() == null || usuario.getNomeCompleto().trim().isEmpty()) {
            logger.error("Nome completo não fornecido");
            throw new IllegalArgumentException("Nome completo é obrigatório");
        }
        if (usuario.getRa() == null || usuario.getRa().trim().isEmpty()) {
            logger.error("R.A não fornecido");
            throw new IllegalArgumentException("R.A é obrigatório");
        }
        String ra = usuario.getRa().trim();
        if (!ra.matches("\\d{9}")) {
            logger.error("R.A inválido: {}", ra);
            throw new IllegalArgumentException("R.A deve conter exatamente 9 dígitos numéricos");
        }
        if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
            logger.error("Email não fornecido");
            throw new IllegalArgumentException("Email é obrigatório");
        }
        String email = usuario.getEmail().trim().toLowerCase();
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            logger.error("Email inválido: {}", email);
            throw new IllegalArgumentException("Email inválido");
        }

        if (usuario.getSenha() == null || usuario.getSenha().isEmpty()) {
            logger.error("Senha não fornecida");
            throw new IllegalArgumentException("Senha é obrigatória");
        }
        if (usuario.getSenha().length() < 6) {
            logger.error("Senha muito curta para o email: {}", email);
            throw new IllegalArgumentException("A senha deve ter pelo menos 6 caracteres");
        }

        usuario.setRa(ra);
        usuario.setEmail(email);

        // Criptografar senha
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        logger.info("Senha criptografada com sucesso");

        // Salvar no banco
        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        logger.info("Usuário salvo com sucesso! ID: {}", usuarioSalvo.getId());

        return usuarioSalvo;
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public boolean autenticar(String email, String senha) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        return usuarioOpt.map(usuario -> passwordEncoder.matches(senha, usuario.getSenha())).orElse(false);
    }

    public boolean emailJaCadastrado(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    public boolean raJaCadastrado(String ra) {
        return usuarioRepository.existsByRa(ra);
    }

}
