package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Usuario; // Importando a classe Usuario para usar no Optional e no método de busca por email
import jakarta.persistence.criteria.CriteriaBuilder.In; // Importando o CriteriaBuilder para usar o método existsByEmail

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    Optional<Usuario> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
}
