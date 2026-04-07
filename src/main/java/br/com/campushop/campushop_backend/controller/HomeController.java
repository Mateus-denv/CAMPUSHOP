package br.com.campushop.campushop_backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index(Model model) {
        return "forward:/index.html";
    }

    @GetMapping("/home")
    public String home(Model model, Authentication authentication) {
        return "forward:/index.html";
    }

}
