package br.com.campushop.campushop_backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }

    @GetMapping("/home")
    public String home() {
        return "forward:/index.html";
    }

    @GetMapping("/categorias")
    public String categorias() {
        return "forward:/index.html";
    }

    @GetMapping("/produtos")
    public String produtos() {
        return "forward:/index.html";
    }

    @GetMapping("/carrinho")
    public String carrinho() {
        return "forward:/index.html";
    }

    @GetMapping("/conta")
    public String conta() {
        return "forward:/index.html";
    }

    @GetMapping("/chat")
    public String chat() {
        return "forward:/index.html";
    }

    @GetMapping("/pedidos")
    public String pedidos() {
        return "forward:/index.html";
    }

    @GetMapping("/cadastrar-produto")
    public String cadastrarProduto() {
        return "forward:/index.html";
    }

    @GetMapping("/ajuda")
    public String ajuda() {
        return "forward:/index.html";
    }

    @GetMapping("/manual-usuario")
    public String manualUsuario() {
        return "forward:/index.html";
    }

    @GetMapping("/privacidade")
    public String privacidade() {
        return "forward:/index.html";
    }

    @GetMapping("/termos")
    public String termos() {
        return "forward:/index.html";
    }

    @GetMapping("/anunciar")
    public String anunciar() {
        return "forward:/index.html";
    }

    @GetMapping("/produto/{id}")
    public String produtoDetalhe(@PathVariable String id) {
        return "forward:/index.html";
    }

    @GetMapping("/esqueci-senha")
    public String esqueciSenha() {
        // Permite que a SPA renderize a página de recuperação quando o usuário acessa
        // diretamente esta rota
        return "forward:/index.html";
    }

    @GetMapping("/redefinir-senha")
    public String redefinirSenha() {
        // Permite que a SPA renderize a página de redefinição de senha quando acessada
        // por link
        return "forward:/index.html";
    }

}
