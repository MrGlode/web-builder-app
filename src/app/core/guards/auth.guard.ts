import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { LoggerService } from "../services/logger.service";

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const loggerService = inject(LoggerService);

    if (authService.isAuthenticated()) {
        loggerService.debug('Auth guard: access granted to', state.url);
        return true;
    }

    loggerService.warn('Auth guard: access denied to', state.url);

    router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
    });

    return false;
};