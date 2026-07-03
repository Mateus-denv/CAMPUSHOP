package br.com.campushop.campushop_backend.exception;

public class PlanPermissionDeniedException extends RuntimeException {

    public PlanPermissionDeniedException(String message) {
        super(message);
    }
}
