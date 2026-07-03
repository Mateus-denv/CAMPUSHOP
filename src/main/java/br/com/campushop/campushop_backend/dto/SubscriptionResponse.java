package br.com.campushop.campushop_backend.dto;

import br.com.campushop.campushop_backend.model.PlanType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SubscriptionResponse(
        Integer id,
        Integer userId,
        PlanType plan,
        String planName,
        LocalDate startDate,
        LocalDate endDate,
        Boolean active,
        BigDecimal monthlyPrice,
        Boolean autoRenew,
        String badgeColor,
        String badgeText,
        String badgeIcon,
        Boolean canBoost,
        Boolean canHighlight,
        Integer remainingListings) {
}
