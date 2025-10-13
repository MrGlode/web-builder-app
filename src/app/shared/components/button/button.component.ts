// src/app/shared/components/button/button.component.ts

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="getButtonClasses()"
      (click)="handleClick($event)">
      
      <!-- Loading spinner -->
      <span class="button__spinner" *ngIf="loading()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      </span>

      <!-- Icon gauche -->
      <span class="button__icon" *ngIf="iconLeft() && !loading()">
        <ng-content select="[iconLeft]"></ng-content>
      </span>

      <!-- Contenu -->
      <span class="button__content" [class.button__content--hidden]="loading()">
        <ng-content></ng-content>
      </span>

      <!-- Icon droite -->
      <span class="button__icon" *ngIf="iconRight() && !loading()">
        <ng-content select="[iconRight]"></ng-content>
      </span>
    </button>
  `,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  // Inputs
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  iconLeft = input<boolean>(false);
  iconRight = input<boolean>(false);

  // Output
  clicked = output<MouseEvent>();

  handleClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }

  getButtonClasses(): string {
    const classes = ['button'];
    
    classes.push(`button--${this.variant()}`);
    classes.push(`button--${this.size()}`);
    
    if (this.fullWidth()) {
      classes.push('button--full-width');
    }
    
    if (this.loading()) {
      classes.push('button--loading');
    }
    
    return classes.join(' ');
  }
}