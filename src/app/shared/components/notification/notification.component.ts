// src/app/shared/components/notification/notification.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications">
      <div
        *ngFor="let notification of notificationService.notifications()"
        class="notification"
        [class]="getNotificationClasses(notification)"
        [@slideIn]>
        
        <!-- Icon -->
        <div class="notification__icon">
          <ng-container [ngSwitch]="notification.type">
            <!-- Success -->
            <svg *ngSwitchCase="'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            
            <!-- Error -->
            <svg *ngSwitchCase="'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            
            <!-- Warning -->
            <svg *ngSwitchCase="'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            
            <!-- Info -->
            <svg *ngSwitchCase="'info'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </ng-container>
        </div>

        <!-- Content -->
        <div class="notification__content">
          <h4 class="notification__title" *ngIf="notification.title">
            {{ notification.title }}
          </h4>
          <p class="notification__message">{{ notification.message }}</p>
        </div>

        <!-- Close button -->
        <button
          *ngIf="notification.dismissible"
          class="notification__close"
          (click)="dismiss(notification.id)"
          aria-label="Fermer la notification">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  notificationService = inject(NotificationService);

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }

  getNotificationClasses(notification: Notification): string {
    return `notification notification--${notification.type}`;
  }
}