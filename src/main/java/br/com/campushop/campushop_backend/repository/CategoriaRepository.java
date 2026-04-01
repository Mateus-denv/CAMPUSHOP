package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    // O Spring Data JPA já nos dá o CRUD de presente aqui!
}