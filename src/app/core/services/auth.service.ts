import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError, delay, tap } from 'rxjs';
import { User, LoginCredentials, LoginResponse, RegisterData, UserRole } from '../models/user.model';
import { ConfigService } from './config.service';
import { LoggerService } from './logger.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSignal = signal<User | null>(null);
    private isAuthenticatedSignal = signal<boolean>(false);
    private isLoadingSignal = signal<boolean>(false);

    currentUser = this.currentUserSignal.asReadonly();
    isAuthenticated = this.isAuthenticatedSignal.asReadonly();
    isLoading = this.isLoadingSignal.asReadonly();
    isAdmin = computed(() => this.currentUserSignal()?.role === UserRole.ADMIN);

    private readonly TOKEN_KEY = 'auth_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';
    private readonly USER_KEY = 'current_user';

    private readonly MOCK_USERS: User[] = [
        {
            id: '1',
            email: 'admin@webbuilder.com',
            firstName: 'John',
            lastName: 'Doe',
            role: UserRole.ADMIN,
            avatar: 'https://i.pravatar.cc/150?img=1',
            createdAt: new Date('2025-01-01'),
            lastLogin: new Date()
        },
        {
            id: '2',
            email: 'user@webbuilder.com',
            firstName: 'Jane',
            lastName: 'Smith',
            role: UserRole.USER,
            avatar: 'https://i.pravatar.cc/150?img=2',
            createdAt: new Date('2025-01-01'),
            lastLogin: new Date()
        }
    ];

    constructor(
        private http: HttpClient,
        private router: Router,
        private configService: ConfigService,
        private loggerService: LoggerService
    ) {
        this.initializeAuth();
    }

    private initializeAuth() {
        const storedUser = this.getStoredUser();
        const token = this.getToken();

        if (storedUser && token) {
            this.currentUserSignal.set(storedUser);
            this.isAuthenticatedSignal.set(true);
            this.loggerService.info('User restored from local storage', storedUser.email);
        }
    }

    login(credentials: LoginCredentials): Observable<LoginResponse> {
        this.isLoadingSignal.set(true);
        this.loggerService.info('Attempting login for', credentials.email);

        if (this.configService.useMockApi) {
            return this.mockLogin(credentials);
        }

        return this.http.post<LoginResponse>(`${this.configService.apiUrl}/auth/login`, credentials)
            .pipe(
                tap(response => this.handleLoginSuccess(response)),
                tap(() => this.isLoadingSignal.set(false))
            );
    }

    private mockLogin(credentials: LoginCredentials): Observable<LoginResponse> {
        this.loggerService.debug('Using mock login');

        return of(null).pipe(
            delay(800),
            tap(() => {
                const user = this.MOCK_USERS.find(u => u.email === credentials.email);

                if (!user || credentials.password !== 'password123') {
                    throw new Error('Invalid email or password');
                }

                const response: LoginResponse = {
                    user: {
                        ...user,
                        lastLogin: new Date()
                    },
                    tokens: {
                        accessToken: 'mock_access_token_' + Date.now(),
                        refreshToken: 'mock_refresh_token_' + Date.now(),
                        expiresIn: 3600
                    }
                };

                this.handleLoginSuccess(response);
            }),
            tap(() => this.isLoadingSignal.set(false)),
            delay(0),
            tap(() => { }),
            delay(0)
        ) as any;
    }

    private handleLoginSuccess(response: LoginResponse) {
        this.currentUserSignal.set(response.user);
        this.isAuthenticatedSignal.set(true);
        this.storeTokens(response.tokens);
        this.storeUser(response.user);
        this.loggerService.info('Login successful for', response.user.email);
    }

    logout() {
        this.loggerService.info('Logging out user', this.currentUserSignal()?.email || 'unknown');
        this.currentUserSignal.set(null);
        this.isAuthenticatedSignal.set(false);
        this.clearStorage();
        this.router.navigate(['/login']);
    }

    register(data: RegisterData): Observable<LoginResponse> {
        this.isLoadingSignal.set(true);
        this.loggerService.info('Attempting registration for', data.email);

        if (this.configService.useMockApi){
            return this.mockRegister(data);
        }

        return this.http.post<LoginResponse>(`${this.configService.apiUrl}/auth/register`, data)
            .pipe(
                tap(response => this.handleLoginSuccess(response)),
                tap(() => this.isLoadingSignal.set(false))
            );
    }

    private mockRegister(data: RegisterData): Observable<LoginResponse> {
        this.loggerService.debug('Using mock registration');

        const newUser: User = {
            id: Date.now().toString(),
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: UserRole.USER,
            createdAt: new Date(),
            lastLogin: new Date()
        };

        const response: LoginResponse = {
            user: newUser,
            tokens: {
                accessToken: 'mock_access_token_' + Date.now(),
                refreshToken: 'mock_refresh_token_' + Date.now(),
                expiresIn: 3600
            }
        };

        this.handleLoginSuccess(response);

        return of(response).pipe(
            delay(800),
            tap(() => this.handleLoginSuccess(response)),
            tap(() => this.isLoadingSignal.set(false))
        );
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    private storeUser(user: User) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    private storeTokens(tokens: { accessToken: string; refreshToken: string }): void {
        localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }

    private getStoredUser(): User | null {
        const userJson = localStorage.getItem(this.USER_KEY);
        if (!userJson) return null;

        try {
            return JSON.parse(userJson);
        } catch {
            return null;
        }
    }

    private clearStorage(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) return true;

        if(this.configService.useMockApi){
            return false;
        }

        return false;
    }


}