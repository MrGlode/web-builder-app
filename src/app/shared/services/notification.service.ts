// src/app/shared/services/notification.service.ts

import { Injectable, signal } from '@angular/core';
import { Notification, NotificationType } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Signal pour les notifications actives
  private notificationsSignal = signal<Notification[]>([]);
  notifications = this.notificationsSignal.asReadonly();

  // Durées par défaut (en ms)
  private readonly defaultDurations = {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3000
  };

  /**
   * Affiche une notification de succès
   */
  success(message: string, title?: string, duration?: number): void {
    this.show('success', message, title, duration);
  }

  /**
   * Affiche une notification d'erreur
   */
  error(message: string, title?: string, duration?: number): void {
    this.show('error', message, title, duration);
  }

  /**
   * Affiche une notification d'avertissement
   */
  warning(message: string, title?: string, duration?: number): void {
    this.show('warning', message, title, duration);
  }

  /**
   * Affiche une notification d'information
   */
  info(message: string, title?: string, duration?: number): void {
    this.show('info', message, title, duration);
  }

  /**
   * Affiche une notification personnalisée
   */
  show(
    type: NotificationType,
    message: string,
    title?: string,
    duration?: number,
    dismissible: boolean = true
  ): string {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration: duration || this.defaultDurations[type],
      dismissible
    };

    this.notificationsSignal.update(notifications => [...notifications, notification]);

    // Auto-dismiss après la durée spécifiée
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  /**
   * Ferme une notification spécifique
   */
  dismiss(id: string): void {
    this.notificationsSignal.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  /**
   * Ferme toutes les notifications
   */
  dismissAll(): void {
    this.notificationsSignal.set([]);
  }

  /**
   * Génère un ID unique pour une notification
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}