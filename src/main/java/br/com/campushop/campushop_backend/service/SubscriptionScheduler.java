package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.Subscription;
import br.com.campushop.campushop_backend.repository.SubscriptionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class SubscriptionScheduler {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionService subscriptionService;

    public SubscriptionScheduler(SubscriptionRepository subscriptionRepository, SubscriptionService subscriptionService) {
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionService = subscriptionService;
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void expireExpiredSubscriptions() {
        LocalDate today = LocalDate.now();
        for (Subscription subscription : subscriptionRepository.findByActiveTrueAndEndDateBefore(today)) {
            subscriptionService.expire(subscription);
        }
    }
}
