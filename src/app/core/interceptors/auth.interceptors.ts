import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { LoggerService } from "../services/logger.service";
import { ConfigService } from "../services/logger.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const loggerService = inject(LoggerService);
    const configService = inject(ConfigService);

    if (configService.useMockApi){
        return next(req);
    }

    const publicRoutes = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot', '/auth/confirm-forgot'];
    const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

    if (isPublicRoute) {
        return next(req);
    }

    const token = authService.getToken();

    if (token) {
        const clonedReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(clonedReq);
    }

    return next(req);
};