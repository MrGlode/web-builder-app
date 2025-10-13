// src/app/shared/components/input/input.component.ts

import { Component, input, signal, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
export type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-wrapper" [class.input-wrapper--disabled]="disabled()">
      <!-- Label -->
      <label *ngIf="label()" [for]="id()" class="input__label">
        {{ label() }}
        <span class="input__required" *ngIf="required()">*</span>
      </label>

      <!-- Input container -->
      <div class="input__container" [class]="getContainerClasses()">
        <!-- Icon left -->
        <span class="input__icon input__icon--left" *ngIf="iconLeft()">
          <ng-content select="[iconLeft]"></ng-content>
        </span>

        <!-- Input field -->
        <input
          [id]="id()"
          [type]="getInputType()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [value]="value()"
          [class]="getInputClasses()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          (focus)="onFocus()"
        />

        <!-- Toggle password visibility -->
        <button
          *ngIf="type() === 'password'"
          type="button"
          class="input__toggle-password"
          (click)="togglePasswordVisibility()"
          [attr.aria-label]="showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
          <svg *ngIf="!showPassword()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <svg *ngIf="showPassword()" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </button>

        <!-- Icon right -->
        <span class="input__icon input__icon--right" *ngIf="iconRight() && type() !== 'password'">
          <ng-content select="[iconRight]"></ng-content>
        </span>
      </div>

      <!-- Helper text -->
      <span class="input__helper" *ngIf="helperText() && !error()">
        {{ helperText() }}
      </span>

      <!-- Error message -->
      <span class="input__error" *ngIf="error()">
        {{ errorMessage() }}
      </span>
    </div>
  `,
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements ControlValueAccessor {
  // Inputs
  id = input<string>(`input-${Math.random().toString(36).substr(2, 9)}`);
  label = input<string>('');
  type = input<InputType>('text');
  size = input<InputSize>('md');
  placeholder = input<string>('');
  helperText = input<string>('');
  errorMessage = input<string>('');
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  required = input<boolean>(false);
  error = input<boolean>(false);
  iconLeft = input<boolean>(false);
  iconRight = input<boolean>(false);

  // Signals
  value = signal<string>('');
  showPassword = signal<boolean>(false);
  isFocused = signal<boolean>(false);

  // ControlValueAccessor
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled by disabled input
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.value.set(value);
    this.onChange(value);
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  getInputType(): string {
    if (this.type() === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type();
  }

  getContainerClasses(): string {
    const classes = ['input__container'];
    classes.push(`input__container--${this.size()}`);
    
    if (this.error()) {
      classes.push('input__container--error');
    }
    
    if (this.isFocused()) {
      classes.push('input__container--focused');
    }
    
    if (this.disabled()) {
      classes.push('input__container--disabled');
    }
    
    return classes.join(' ');
  }

  getInputClasses(): string {
    const classes = ['input__field'];
    
    if (this.iconLeft()) {
      classes.push('input__field--with-icon-left');
    }
    
    if (this.iconRight() || this.type() === 'password') {
      classes.push('input__field--with-icon-right');
    }
    
    return classes.join(' ');
  }
}