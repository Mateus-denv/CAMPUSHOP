package br.com.campushop.campushop_backend.validation;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;

@Component
public class UsuarioValidator {

    public void validarIdade(LocalDate dataNascimento) {

        int idade = Period.between(dataNascimento, LocalDate.now()).getYears();

        if (idade < 18) {
            throw new RuntimeException("Usuário deve ter pelo menos 18 anos");
        }
    }
}