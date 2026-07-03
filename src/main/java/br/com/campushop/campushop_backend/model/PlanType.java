package br.com.campushop.campushop_backend.model;

public enum PlanType {
    ESSENTIAL,
    PLUS,
    PREMIUM;

    public String getDisplayName() {
        return switch (this) {
            case ESSENTIAL -> "Essencial";
            case PLUS -> "Plus";
            case PREMIUM -> "Premium";
        };
    }
}
