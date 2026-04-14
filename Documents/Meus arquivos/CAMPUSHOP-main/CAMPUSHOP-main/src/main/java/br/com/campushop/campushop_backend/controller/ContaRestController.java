package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.dto.UsuarioContaResponseDTO;
import br.com.campushop.campushop_backend.entity.Usuario;
import br.com.campushop.campushop_backend.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class ContaRestController {

    private final UsuarioService usuarioService;

    public ContaRestController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioContaResponseDTO> buscarConta(Authentication authentication) {
        Usuario usuario = usuarioService.buscarPorEmailOuFalhar(authentication.getName());

        UsuarioContaResponseDTO response = new UsuarioContaResponseDTO();
        response.setId(usuario.getId());
        response.setNomeCompleto(usuario.getNomeCompleto());
        response.setEmail(usuario.getEmail());
        response.setInstituicao(usuario.getInstituicao());
        response.setCidade(usuario.getCidade());
        response.setTipoUsuario(usuario.getTipoUsuario());

        return ResponseEntity.ok(response);
    }
}
