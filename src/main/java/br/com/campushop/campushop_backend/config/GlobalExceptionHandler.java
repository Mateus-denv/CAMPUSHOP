package br.com.campushop.campushop_backend.config;

import br.com.campushop.campushop_backend.exception.PlanLimitExceededException;
import br.com.campushop.campushop_backend.exception.PlanPermissionDeniedException;
import br.com.campushop.campushop_backend.exception.SubscriptionExpiredException;
import br.com.campushop.campushop_backend.exception.SubscriptionNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PlanLimitExceededException.class)
    public ResponseEntity<Map<String, String>> handlePlanLimit(PlanLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler({PlanPermissionDeniedException.class})
    public ResponseEntity<Map<String, String>> handlePlanPermission(PlanPermissionDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler({SubscriptionExpiredException.class, SubscriptionNotFoundException.class})
    public ResponseEntity<Map<String, String>> handleSubscription(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
    }
}
