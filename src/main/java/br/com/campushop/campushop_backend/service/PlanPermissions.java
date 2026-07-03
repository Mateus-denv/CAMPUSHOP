package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.PlanType;

public class PlanPermissions {

    private final PlanType plan;

    private PlanPermissions(PlanType plan) {
        this.plan = plan == null ? PlanType.ESSENTIAL : plan;
    }

    public static PlanPermissions of(PlanType plan) {
        return new PlanPermissions(plan);
    }

    public boolean canCreateListing() {
        return true;
    }

    public boolean canBoostListing() {
        return plan == PlanType.PREMIUM;
    }

    public boolean canViewAnalytics() {
        return plan == PlanType.PLUS || plan == PlanType.PREMIUM;
    }

    public boolean canHighlightListing() {
        return plan == PlanType.PLUS || plan == PlanType.PREMIUM;
    }

    public int maxListings() {
        return switch (plan) {
            case PLUS -> 50;
            case PREMIUM -> Integer.MAX_VALUE;
            default -> 10;
        };
    }

    public boolean hasPrioritySupport() {
        return plan == PlanType.PLUS || plan == PlanType.PREMIUM;
    }

    public boolean canViewBasicMetrics() {
        return plan == PlanType.PLUS || plan == PlanType.PREMIUM;
    }

    public boolean canViewAdvancedMetrics() {
        return plan == PlanType.PREMIUM;
    }

    public boolean canViewFinancialDashboard() {
        return plan == PlanType.PREMIUM;
    }

    public boolean canViewGrowthCharts() {
        return plan == PlanType.PLUS || plan == PlanType.PREMIUM;
    }

    public boolean canViewAIInsights() {
        return plan == PlanType.PREMIUM;
    }

    public boolean canSeeSellerBadge() {
        return true;
    }

    public boolean canHighlightProfile() {
        return plan == PlanType.PREMIUM;
    }

    public boolean canShowPremiumBorder() {
        return plan == PlanType.PREMIUM;
    }

    public boolean canAccessPrioritySupport() {
        return plan == PlanType.PLUS || plan == PlanType.PREMIUM;
    }

    public String getBadgeColor() {
        return switch (plan) {
            case PLUS -> "#1E88E5"; // azul
            case PREMIUM -> "#DAA520"; // dourado
            default -> "#8E8E8E"; // cinza
        };
    }

    public String getBadgeText() {
        return switch (plan) {
            case PLUS -> "PLUS";
            case PREMIUM -> "PREMIUM";
            default -> "ESSENCIAL";
        };
    }

    public String getBadgeIcon() {
        return switch (plan) {
            case PLUS -> "sparkle";
            case PREMIUM -> "diamond";
            default -> "shield";
        };
    }

    public PlanType getPlan() {
        return plan;
    }
}
