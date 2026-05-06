package br.com.campushop.campushop_backend.validation;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Period;
import java.util.regex.Pattern;

@Component
public class UsuarioValidator {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    public void validarUsuario(String nomeCompleto, String email, String cpfCnpj, LocalDate dataNascimento, String ra) {
        validarNomeCompleto(nomeCompleto);
        validarEmail(email);
        validarCpf(cpfCnpj);
        validarIdade(dataNascimento);
        validarRa(ra);
    }

    public void validarNomeCompleto(String nomeCompleto) {
        if (nomeCompleto == null || nomeCompleto.trim().isEmpty()) {
            throw new RuntimeException("Nome completo é obrigatório");
        }
        if (nomeCompleto.trim().split("\\s+").length < 2) {
            throw new RuntimeException("Nome completo deve conter pelo menos nome e sobrenome");
        }
    }

    public void validarEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email é obrigatório");
        }
        if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new RuntimeException("Email inválido");
        }
    }

    public void validarCpf(String cpf) {
        if (cpf == null || cpf.trim().isEmpty()) {
            throw new RuntimeException("CPF é obrigatório");
        }
        String cpfNumeros = cpf.replaceAll("\\D", "");
        if (cpfNumeros.length() != 11) {
            throw new RuntimeException("CPF deve ter 11 dígitos");
        }
        if (!isCpfValido(cpfNumeros)) {
            throw new RuntimeException("CPF inválido");
        }
    }

    private boolean isCpfValido(String cpf) {
        // Algoritmo de validação de CPF
        int[] pesos1 = { 10, 9, 8, 7, 6, 5, 4, 3, 2 };
        int[] pesos2 = { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 };

        int soma1 = 0;
        for (int i = 0; i < 9; i++) {
            soma1 += (cpf.charAt(i) - '0') * pesos1[i];
        }
        int digito1 = 11 - (soma1 % 11);
        if (digito1 > 9)
            digito1 = 0;

        int soma2 = 0;
        for (int i = 0; i < 10; i++) {
            soma2 += (cpf.charAt(i) - '0') * pesos2[i];
        }
        int digito2 = 11 - (soma2 % 11);
        if (digito2 > 9)
            digito2 = 0;

        return (cpf.charAt(9) - '0') == digito1 && (cpf.charAt(10) - '0') == digito2;
    }

    public void validarIdade(LocalDate dataNascimento) {
        if (dataNascimento == null) {
            throw new RuntimeException("Data de nascimento é obrigatória");
        }
        int idade = Period.between(dataNascimento, LocalDate.now()).getYears();
        if (idade < 18) {
            throw new RuntimeException("Usuário deve ter pelo menos 18 anos");
        }
    }

    public void validarRa(String ra) {
        if (ra == null || ra.trim().isEmpty()) {
            throw new RuntimeException("RA é obrigatório");
        }
    }
}