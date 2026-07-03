package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.dto.SubscriptionResponse;
import br.com.campushop.campushop_backend.model.PlanType;
import br.com.campushop.campushop_backend.model.Subscription;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import br.com.campushop.campushop_backend.repository.SubscriptionRepository;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ProdutoRepository produtoRepository;

    private SubscriptionService subscriptionService;

    @BeforeEach
    void setUp() {
        subscriptionService = new SubscriptionService(subscriptionRepository, usuarioRepository, produtoRepository);
    }

    @Test
    void subscribeShouldCreatePlusPlan() {
        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setEmail("user@campus.com");
        when(subscriptionRepository.findByUserAndActiveTrue(any())).thenReturn(Optional.empty());
        when(usuarioRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(subscriptionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Subscription subscription = subscriptionService.subscribe(usuario, PlanType.PLUS);

        assertEquals(PlanType.PLUS, subscription.getPlan());
        assertEquals(new BigDecimal("19.90"), subscription.getMonthlyPrice());
        assertTrue(subscription.isActive());
    }

    @Test
    void renewShouldExtendEndDate() {
        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setEmail("user@campus.com");
        Subscription current = new Subscription();
        current.setUser(usuario);
        current.setPlan(PlanType.PREMIUM);
        current.setActive(Boolean.TRUE);
        current.setEndDate(LocalDate.now());

        when(subscriptionRepository.findByUserAndActiveTrue(any())).thenReturn(Optional.of(current));
        when(subscriptionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Subscription renewed = subscriptionService.renew(usuario);

        assertEquals(PlanType.PREMIUM, renewed.getPlan());
        assertEquals(LocalDate.now().plusMonths(1), renewed.getEndDate());
    }

    @Test
    void cancelShouldDisableCurrentSubscription() {
        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setEmail("user@campus.com");
        Subscription current = new Subscription();
        current.setUser(usuario);
        current.setPlan(PlanType.PREMIUM);
        current.setActive(Boolean.TRUE);

        when(subscriptionRepository.findByUserAndActiveTrue(any())).thenReturn(Optional.of(current));
        when(usuarioRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(subscriptionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Subscription cancelled = subscriptionService.cancel(usuario);

        assertFalse(cancelled.isActive());
        assertFalse(Boolean.TRUE.equals(cancelled.getAutoRenew()));
    }

    @Test
    void toResponseShouldExposeRemainingListings() {
        Usuario usuario = new Usuario();
        usuario.setId(1);
        usuario.setEmail("user@campus.com");
        Subscription subscription = new Subscription();
        subscription.setUser(usuario);
        subscription.setPlan(PlanType.ESSENTIAL);
        subscription.setActive(Boolean.TRUE);
        usuario.setSubscription(subscription);

        when(subscriptionRepository.findByUserAndActiveTrue(any())).thenReturn(Optional.of(subscription));
        when(produtoRepository.countByUsuario_EmailAndProdutoPaiIsNull("user@campus.com")).thenReturn(4L);

        SubscriptionResponse response = subscriptionService.toResponse(usuario);

        assertEquals(6, response.remainingListings());
        assertEquals("ESSENCIAL", response.badgeText());
    }
}
