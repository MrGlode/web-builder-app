// src/app/features/visual-builder/components/component-renderer/component-renderer.component.ts

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuilderComponent } from '../../models/component.model';
import { StylesPipe, ComponentClassPipe } from '../../pipes/styles.pipe';

/**
 * Composant pour rendre un BuilderComponent en HTML réel
 * Affiche le composant avec ses styles et son contenu
 */
@Component({
  selector: 'app-component-renderer',
  standalone: true,
  imports: [CommonModule, StylesPipe, ComponentClassPipe],
  templateUrl: './component-renderer.component.html',
  styleUrl: './component-renderer.component.scss'
})
export class ComponentRendererComponent {
  
  // ===========================
  // INPUTS
  // ===========================
  
  /** Composant à rendre */
  component = input.required<BuilderComponent>();
  
  /** Mode édition (affiche les contrôles) */
  isEditMode = input<boolean>(true);
  
  /** Composant sélectionné */
  isSelected = input<boolean>(false);
  
  // ===========================
  // OUTPUTS
  // ===========================
  
  /** Émis au clic sur le composant */
  componentClick = output<BuilderComponent>();
  
  /** Émis au double-clic (édition inline) */
  componentDoubleClick = output<BuilderComponent>();
  
  // ===========================
  // MÉTHODES
  // ===========================
  
  /**
   * Gère le clic sur le composant
   */
  onClick(event: Event): void {
    if (this.isEditMode()) {
      event.stopPropagation();
      this.componentClick.emit(this.component());
    }
  }
  
  /**
   * Gère le double-clic
   */
  onDoubleClick(event: Event): void {
    if (this.isEditMode()) {
      event.stopPropagation();
      this.componentDoubleClick.emit(this.component());
    }
  }
  
  /**
   * Obtient le contenu texte
   */
  getTextContent(): string {
    return this.component().properties.content?.text || '';
  }
  
  /**
   * Obtient la source d'une image
   */
  getImageSrc(): string {
    return this.component().properties.content?.src || 'https://via.placeholder.com/400x200';
  }
  
  /**
   * Obtient le texte alt d'une image
   */
  getImageAlt(): string {
    return this.component().properties.content?.alt || 'Image';
  }
  
  /**
   * Obtient le placeholder d'un input
   */
  getPlaceholder(): string {
    return this.component().properties.content?.placeholder || '';
  }
  
  /**
   * Obtient la valeur d'un input
   */
  getValue(): string {
    return this.component().properties.content?.value || '';
  }
  
  /**
   * Obtient le label d'un checkbox/radio
   */
  getLabel(): string {
    return this.component().properties.content?.label || 'Option';
  }
  
  /**
   * Vérifie si un composant est un container
   */
  isContainer(): boolean {
    return !!this.component().children && this.component().children!.length > 0;
  }
  
  /**
   * Obtient le niveau de heading (h1-h6)
   */
  getHeadingLevel(): number {
    const fontSize = this.component().properties.styles.fontSize;
    
    if (!fontSize) return 2;
    
    const size = parseInt(fontSize);
    
    if (size >= 36) return 1;
    if (size >= 30) return 2;
    if (size >= 24) return 3;
    if (size >= 20) return 4;
    if (size >= 18) return 5;
    return 6;
  }
  
  /**
   * Vérifie si un attribut est défini
   */
  hasAttribute(name: string): boolean {
    return !!this.component().properties.attributes?.[name];
  }
  
  /**
   * Obtient la valeur d'un attribut
   */
  getAttribute(name: string): any {
    return this.component().properties.attributes?.[name];
  }
}