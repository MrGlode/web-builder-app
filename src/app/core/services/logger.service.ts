import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config.service';

export { Injectable } from '@angular/core';
export { ConfigService } from './config.service';

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    private readonly logLevels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    };

    private readonly confService = inject(ConfigService);

    debug(message: string, ...optionalParams: any[]): void {
        this.log(LogLevel.DEBUG, message, ...optionalParams);
    }

    info(message: string, ...optionalParams: any[]): void {
        this.log(LogLevel.INFO, message, ...optionalParams);
    }

    warn(message: string, ...optionalParams: any[]): void {
        this.log(LogLevel.WARN, message, ...optionalParams);
    }
    
    error(message: string, ...optionalParams: any[]): void {
        this.log(LogLevel.ERROR, message, ...optionalParams);
    }

    private log(level: LogLevel, message: string, ...args: any[]): void {
        const configLevel = this.confService.logLevel;
        const currentLevelValue = this.logLevels[level];
        const configLevelValue = this.logLevels[configLevel as keyof typeof this.logLevels];

        if (currentLevelValue < configLevelValue) {
            return;
        }

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        switch (level) {
            case LogLevel.DEBUG:
                console.debug(prefix, message, ...args);
                break;
            case LogLevel.INFO:
                console.info(prefix, message, ...args);
                break;
            case LogLevel.WARN:
                console.warn(prefix, message, ...args);
                break;
            case LogLevel.ERROR:
                console.error(prefix, message, ...args);
                break;
        }
    }

    group(title: string, callback: () => void): void {
        if (this.confService.logLevel === 'debug') {
            console.group(title);
            callback();
            console.groupEnd();
        }
    }
}