export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
    createdAt: Date;
    lastLogin?: Date;
}

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user', 
    GUEST = 'guest'
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}