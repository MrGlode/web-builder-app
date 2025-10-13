import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { LoggerService } from "../services/logger.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const logger = inject(LoggerService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur: ${error.error.message}`;
        logger.error('Client-side error', error.error);
      } else {
        // Erreur côté serveur
        errorMessage = `Erreur ${error.status}: ${error.message}`;
        logger.error('Server-side error', {
          status: error.status,
          message: error.message,
          url: req.url
        });

        switch (error.status) {
          case 401:
            logger.warn('Unauthorized access, logging out');
            authService.logout();
            break;

          case 403:
            logger.warn('Forbidden access', req.url);
            router.navigate(['/']);
            errorMessage = 'Vous n\'avez pas les droits pour accéder à cette ressource';
            break;

          case 404:
            errorMessage = 'Ressource non trouvée';
            break;

          case 500:
            errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
            break;

          case 0:
            errorMessage = 'Impossible de contacter le serveur';
            break;
        }
      }

      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        originalError: error
      }));
    })
  );
};