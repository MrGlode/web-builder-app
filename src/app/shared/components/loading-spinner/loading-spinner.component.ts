// src/app/shared/components/loading-spinner/loading-spinner.component.ts

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-wrapper" [class]="getWrapperClasses()">
      <div class="spinner" [class]="getSpinnerClasses()">
        <svg viewBox="0 0 24 24" fill="none">
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            stroke-width="3">
          </circle>
        </svg>
      </div>
      <p class="spinner__text" *ngIf="text()">{{ text() }}</p>
    </div>
  `,
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent {
  // Inputs
  size = input<SpinnerSize>('md');
  text = input<string>('');
  overlay = input<boolean>(false);
  color = input<string>('primary');

  getWrapperClasses(): string {
    const classes = ['spinner-wrapper'];
    
    if (this.overlay()) {
      classes.push('spinner-wrapper--overlay');
    }
    
    return classes.join(' ');
  }

  getSpinnerClasses(): string {
    const classes = ['spinner'];
    classes.push(`spinner--${this.size()}`);
    classes.push(`spinner--${this.color()}`);
    return classes.join(' ');
  }
}