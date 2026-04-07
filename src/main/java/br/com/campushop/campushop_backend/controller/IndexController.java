package br.com.campushop.campushop_backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

    @GetMapping({ "/carrinho", "/produtos" })
    public String index() {
        return "forward:/index.html";
    }
}
