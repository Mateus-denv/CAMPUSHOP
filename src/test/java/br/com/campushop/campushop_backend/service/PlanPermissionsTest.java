package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.PlanType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PlanPermissionsTest {

    @Test
    void essentialShouldHaveBasicLimits() {
        PlanPermissions permissions = PlanPermissions.of(PlanType.ESSENTIAL);

        assertTrue(permissions.canCreateListing());
        assertFalse(permissions.canBoostListing());
        assertFalse(permissions.canViewAdvancedMetrics());
        assertEquals(10, permissions.maxListings());
    }

    @Test
    void premiumShouldUnlockAdvancedFeatures() {
        PlanPermissions permissions = PlanPermissions.of(PlanType.PREMIUM);

        assertTrue(permissions.canBoostListing());
        assertTrue(permissions.canViewAnalytics());
        assertTrue(permissions.canViewFinancialDashboard());
        assertTrue(permissions.canViewAIInsights());
        assertEquals(Integer.MAX_VALUE, permissions.maxListings());
    }
}
