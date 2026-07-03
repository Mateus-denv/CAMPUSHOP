package br.com.campushop.campushop_backend.repository;

import br.com.campushop.campushop_backend.model.Subscription;
import br.com.campushop.campushop_backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Integer> {

    Optional<Subscription> findByUserAndActiveTrue(Usuario user);

    long countByUserAndActiveTrue(Usuario user);

    List<Subscription> findByActiveTrueAndEndDateBefore(LocalDate date);
}
