package br.com.campushop.campushop_backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("titulo", "CampusShop - Home");
        return "home";
    }

    @GetMapping("/home")
    public String home(Model model, Authentication authentication) {
        if (authentication != null) {
            model.addAttribute("usuario", authentication.getName());
        }
        model.addAttribute("titulo", "CampusShop - Dashboard");
        return "home";
    }

    @GetMapping("/produtos")
    public String produtos(Model model, Authentication authentication) {
        if (authentication != null) {
            model.addAttribute("usuario", authentication.getName());
        }
        model.addAttribute("titulo", "CampusShop - Produtos");
        return "produtos";
    }

    @GetMapping("/conta")
    public String conta(Model model, Authentication authentication) {
        if (authentication != null) {
            model.addAttribute("usuario", authentication.getName());
        }
        model.addAttribute("titulo", "CampusShop - Minha Conta");
        return "conta";
    }

}
