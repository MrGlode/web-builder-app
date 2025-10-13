// src/app/features/visual-builder/pipes/styles.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';
import { ComponentStyles } from '../models/component.model';

/**
 * Pipe pour transformer les styles en objet CSS
 * Utilisable avec [ngStyle]
 */
@Pipe({
  name: 'toStyles',
  standalone: true
})
export class StylesPipe implements PipeTransform {
  
  /**
   * Transforme un objet ComponentStyles en objet CSS
   * 
   * @param styles - Styles du composant
   * @returns Objet CSS pour [ngStyle]
   */
  transform(styles: ComponentStyles | undefined): Record<string, any> {
    if (!styles) return {};
    
    const cssObj: Record<string, any> = {};
    
    Object.entries(styles).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cssObj[key] = value;
      }
    });
    
    return cssObj;
  }
}

/**
 * Pipe pour générer une classe CSS basée sur le type
 */
@Pipe({
  name: 'componentClass',
  standalone: true
})
export class ComponentClassPipe implements PipeTransform {
  
  transform(type: string): string {
    return `rendered-${type}`;
  }
}

/**
 * Pipe pour nettoyer le contenu HTML
 */
@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  
  transform(html: string | undefined): string {
    if (!html) return '';
    
    // Nettoyer les scripts et autres éléments dangereux
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '');
  }
}