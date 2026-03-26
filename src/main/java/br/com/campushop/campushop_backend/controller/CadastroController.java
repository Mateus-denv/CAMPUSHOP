package br.com.campushop.campushop_backend.controller;

import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class CadastroController {

    private final UsuarioService usuarioService;

    @Autowired
    public CadastroController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/cadastro")
    public String cadastroForm(Model model) {
        model.addAttribute("titulo", "CampusShop - Cadastro");
        model.addAttribute("usuario", new Usuario());
        return "cadastro";
    }

    @PostMapping("/cadastro")
    public String cadastrar(Usuario usuario, String confirmarSenha, RedirectAttributes redirectAttributes) {

        if (usuario.getRa() == null || usuario.getRa().trim().isEmpty()) {
            redirectAttributes.addFlashAttribute("erro", "R.A é obrigatório para cadastro");
            redirectAttributes.addFlashAttribute("usuario", usuario);
            return "redirect:/cadastro";
        }

        String ra = usuario.getRa().trim();
        if (!ra.matches("\\d{9}")) {
            redirectAttributes.addFlashAttribute("erro", "R.A deve conter exatamente 9 dígitos numéricos");
            redirectAttributes.addFlashAttribute("usuario", usuario);
            return "redirect:/cadastro";
        }

        // Validar senha
        if (usuario.getSenha() == null || usuario.getSenha().length() < 6) {
            redirectAttributes.addFlashAttribute("erro", "A senha deve ter pelo menos 6 caracteres");
            redirectAttributes.addFlashAttribute("usuario", usuario);
            return "redirect:/cadastro";
        }

        // Validar confirmação de senha
        if (!usuario.getSenha().equals(confirmarSenha)) {
            redirectAttributes.addFlashAttribute("erro", "As senhas não coincidem");
            redirectAttributes.addFlashAttribute("usuario", usuario);
            return "redirect:/cadastro";
        }

        // Verificar se email já existe
        if (usuarioService.emailJaCadastrado(usuario.getEmail())) {
            redirectAttributes.addFlashAttribute("erro", "Email já cadastrado");
            redirectAttributes.addFlashAttribute("usuario", usuario);
            return "redirect:/cadastro";
        }

        if (usuarioService.raJaCadastrado(ra)) {
            redirectAttributes.addFlashAttribute("erro", "R.A já cadastrado");
            redirectAttributes.addFlashAttribute("usuario", usuario);
            return "redirect:/cadastro";
        }

        try {
            usuarioService.salvar(usuario);
            redirectAttributes.addFlashAttribute("sucesso", "Cadastro realizado com sucesso! Faça o login.");
            return "redirect:/login";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("erro", "Erro ao salvar usuário: " + e.getMessage());
            redirectAttributes.addFlashAttribute("usuario", usuario);
            return "redirect:/cadastro";
        }
    }

}
