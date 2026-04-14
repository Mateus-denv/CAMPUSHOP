package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    // O Spring Boot já cria os métodos como findAll(), save(), findById() automaticamente para nós!
}