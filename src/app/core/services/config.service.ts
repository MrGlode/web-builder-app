import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private readonly config = environment;
    
    get isProduction(): boolean {
        return this.config.production;
    }

    get useMockApi(): boolean {
        return this.config.useMockApi;
    }

    get apiUrl(): string {
        return this.config.apiUrl;
    }

    get apiTimeout(): number {
        return this.config.apiTimeout;
    }

    get logLevel(): string {
        return this.config.logLevel;
    }

    isFeatureEnabled(featureName: string): boolean {
        return this.config.features[featureName as keyof typeof this.config.features] || false;
    }

    getConfig<T>(key: string): T | undefined {
        return (this.config as any)[key];
    }
}