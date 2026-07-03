package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.dto.SubscriptionResponse;
import br.com.campushop.campushop_backend.exception.SubscriptionNotFoundException;
import br.com.campushop.campushop_backend.model.PlanType;
import br.com.campushop.campushop_backend.model.Subscription;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.repository.ProdutoRepository;
import br.com.campushop.campushop_backend.repository.SubscriptionRepository;
import br.com.campushop.campushop_backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, UsuarioRepository usuarioRepository,
            ProdutoRepository produtoRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.usuarioRepository = usuarioRepository;
        this.produtoRepository = produtoRepository;
    }

    @Transactional(readOnly = true)
    public Subscription findCurrentSubscription(Usuario usuario) {
        if (usuario == null || usuario.getId() == null) {
            throw new SubscriptionNotFoundException("Assinatura não encontrada");
        }

        return subscriptionRepository.findByUserAndActiveTrue(usuario)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public Subscription getCurrentPlan(Usuario usuario) {
        Subscription subscription = findCurrentSubscription(usuario);
        if (subscription != null) {
            return subscription;
        }

        Subscription fallback = new Subscription();
        fallback.setUser(usuario);
        fallback.setPlan(PlanType.ESSENTIAL);
        fallback.setMonthlyPrice(BigDecimal.ZERO);
        fallback.setActive(Boolean.TRUE);
        fallback.setAutoRenew(Boolean.FALSE);
        fallback.setStartDate(LocalDate.now());
        return fallback;
    }

    @Transactional(readOnly = true)
    public SubscriptionResponse toResponse(Usuario usuario) {
        Subscription subscription = getCurrentPlan(usuario);
        PlanPermissions permissions = PlanPermissions.of(subscription.getPlan());
        int remainingListings = permissions.maxListings() == Integer.MAX_VALUE
            ? -1
                : Math.max(0, permissions.maxListings() - (int) produtoRepository.countByUsuario_EmailAndProdutoPaiIsNull(usuario != null ? usuario.getEmail() : null));

        return new SubscriptionResponse(
                subscription.getId(),
                usuario != null ? usuario.getId() : null,
                subscription.getPlan(),
                subscription.getPlan() != null ? subscription.getPlan().getDisplayName() : PlanType.ESSENTIAL.getDisplayName(),
                subscription.getStartDate(),
                subscription.getEndDate(),
                subscription.getActive(),
                subscription.getMonthlyPrice(),
                subscription.getAutoRenew(),
                permissions.getBadgeColor(),
                permissions.getBadgeText(),
                permissions.getBadgeIcon(),
                permissions.canBoostListing(),
                permissions.canHighlightListing(),
                remainingListings);
    }

    @Transactional
    public Subscription subscribe(Usuario usuario, PlanType plan) {
        Subscription current = findCurrentSubscription(usuario);
        if (current != null) {
            current.setActive(Boolean.FALSE);
            subscriptionRepository.save(current);
        }

        Subscription subscription = new Subscription();
        subscription.setUser(usuario);
        subscription.setPlan(plan);
        subscription.setMonthlyPrice(priceOf(plan));
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusMonths(1));
        subscription.setActive(Boolean.TRUE);
        subscription.setAutoRenew(Boolean.TRUE);
        usuario.setSubscription(subscription);
        usuarioRepository.save(usuario);
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public Subscription upgrade(Usuario usuario, PlanType plan) {
        return subscribe(usuario, plan);
    }

    @Transactional
    public Subscription downgrade(Usuario usuario) {
        return subscribe(usuario, PlanType.ESSENTIAL);
    }

    @Transactional
    public Subscription cancel(Usuario usuario) {
        Subscription subscription = findCurrentSubscription(usuario);
        if (subscription == null) {
            throw new SubscriptionNotFoundException("Assinatura não encontrada");
        }
        subscription.setAutoRenew(Boolean.FALSE);
        subscription.setActive(Boolean.FALSE);
        usuario.setSubscription(null);
        usuarioRepository.save(usuario);
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public Subscription renew(Usuario usuario) {
        Subscription subscription = findCurrentSubscription(usuario);
        if (subscription == null) {
            throw new SubscriptionNotFoundException("Assinatura não encontrada");
        }
        subscription.setEndDate(LocalDate.now().plusMonths(1));
        subscription.setActive(Boolean.TRUE);
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public Subscription activate(Usuario usuario, Subscription subscription) {
        subscription.setUser(usuario);
        subscription.setActive(Boolean.TRUE);
        usuario.setSubscription(subscription);
        usuarioRepository.save(usuario);
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public Subscription expire(Subscription subscription) {
        subscription.setActive(Boolean.FALSE);
        return subscriptionRepository.save(subscription);
    }

    private BigDecimal priceOf(PlanType plan) {
        return switch (plan) {
            case PLUS -> new BigDecimal("9.90");
            case PREMIUM -> new BigDecimal("19.90");
            default -> BigDecimal.ZERO;
        };
    }
}
