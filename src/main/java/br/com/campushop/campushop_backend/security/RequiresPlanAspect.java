package br.com.campushop.campushop_backend.security;

import br.com.campushop.campushop_backend.exception.PlanPermissionDeniedException;
import br.com.campushop.campushop_backend.model.PlanType;
import br.com.campushop.campushop_backend.model.Usuario;
import br.com.campushop.campushop_backend.service.PlanPermissions;
import br.com.campushop.campushop_backend.service.UsuarioService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class RequiresPlanAspect {

    private final UsuarioService usuarioService;

    public RequiresPlanAspect(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Before("@annotation(requiresPlan)")
    public void verifyPlan(JoinPoint joinPoint, RequiresPlan requiresPlan) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new PlanPermissionDeniedException("Seu plano não possui acesso a este recurso.");
        }

        Usuario usuario = usuarioService.buscarPorEmail(authentication.getName())
                .orElseThrow(() -> new PlanPermissionDeniedException("Seu plano não possui acesso a este recurso."));

        PlanType currentPlan = usuario.getSubscription() != null && Boolean.TRUE.equals(usuario.getSubscription().getActive())
                ? usuario.getSubscription().getPlan()
                : PlanType.ESSENTIAL;

        if (rank(currentPlan) < rank(requiresPlan.value())) {
            throw new PlanPermissionDeniedException("Seu plano não possui acesso a este recurso.");
        }

        PlanPermissions.of(currentPlan);
    }

    private int rank(PlanType planType) {
        return switch (planType) {
            case ESSENTIAL -> 1;
            case PLUS -> 2;
            case PREMIUM -> 3;
        };
    }
}
