package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Usuario; // Importando a classe Usuario para usar no Optional e no método de busca por email

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByRa(String ra);

    boolean existsByEmail(String email);

    boolean existsByRa(String ra);

}
