package br.com.campushop.campushop_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.campushop.campushop_backend.model.PasswordResetToken;
import br.com.campushop.campushop_backend.model.Usuario;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUsuario(Usuario usuario);

    void deleteByUsuario(Usuario usuario);
}
