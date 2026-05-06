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

    @GetMapping("/produto/{id}")
    public String produtoDetalhe(@PathVariable String id) {
        return "forward:/index.html";
    }

}
