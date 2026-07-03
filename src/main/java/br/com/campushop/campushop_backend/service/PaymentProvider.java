package br.com.campushop.campushop_backend.service;

import br.com.campushop.campushop_backend.model.Subscription;

public interface PaymentProvider {

    void createSubscription(Subscription subscription);

    void cancelSubscription(Subscription subscription);

    void renewSubscription(Subscription subscription);

    void refund(Subscription subscription);
}
