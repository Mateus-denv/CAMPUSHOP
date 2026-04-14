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

}
