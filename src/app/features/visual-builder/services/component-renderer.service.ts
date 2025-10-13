// src/app/features/visual-builder/services/component-renderer.service.ts

import { Injectable } from '@angular/core';
import { BuilderComponent, ComponentStyles } from '../models/component.model';

/**
 * Service de rendu des composants
 * Transforme les modèles en HTML/CSS pour l'affichage
 */
@Injectable({
  providedIn: 'root'
})
export class ComponentRendererService {

  /**
   * Génère le HTML pour un composant
   * 
   * @param component - Composant à rendre
   * @returns HTML string
   */
  renderComponentHTML(component: BuilderComponent): string {
    const content = component.properties.content || {};
    
    switch (component.type) {
      // ===========================
      // LAYOUT
      // ===========================
      case 'container':
      case 'section':
        return this.renderContainer(component);
      
      case 'grid':
      case 'flexbox':
        return this.renderContainer(component);
      
      case 'divider':
        return '<hr>';
      
      // ===========================
      // FORMS
      // ===========================
      case 'input':
        return `<input type="${content.type || 'text'}" 
                       placeholder="${content.placeholder || ''}" 
                       value="${content.value || ''}" 
                       ${component.properties.attributes?.disabled ? 'disabled' : ''}>`;
      
      case 'textarea':
        return `<textarea 
                  placeholder="${content.placeholder || ''}" 
                  rows="${component.properties.attributes?.rows || 5}"
                  ${component.properties.attributes?.disabled ? 'disabled' : ''}>${content.value || ''}</textarea>`;
      
      case 'select':
        return `<select ${component.properties.attributes?.disabled ? 'disabled' : ''}>
                  <option value="">Sélectionner...</option>
                  <option value="1">Option 1</option>
                  <option value="2">Option 2</option>
                </select>`;
      
      case 'checkbox':
        return `<label>
                  <input type="checkbox" ${content.value ? 'checked' : ''}>
                  <span>${content.label || 'Option'}</span>
                </label>`;
      
      case 'radio':
        return `<label>
                  <input type="radio" name="${component.properties.attributes?.name || 'radio'}">
                  <span>${content.label || 'Option'}</span>
                </label>`;
      
      case 'button':
        return `<button type="${component.properties.attributes?.type || 'button'}">
                  ${content.text || 'Button'}
                </button>`;
      
      // ===========================
      // CONTENT
      // ===========================
      case 'heading':
        const level = this.getHeadingLevel(component);
        return `<h${level}>${content.text || 'Heading'}</h${level}>`;
      
      case 'paragraph':
        return `<p>${content.text || 'Paragraph text'}</p>`;
      
      case 'list':
        const ordered = component.properties.attributes?.type === 'ordered';
        const tag = ordered ? 'ol' : 'ul';
        return `<${tag}>
                  <li>Item 1</li>
                  <li>Item 2</li>
                  <li>Item 3</li>
                </${tag}>`;
      
      case 'table':
        return `<table>
                  <thead>
                    <tr>
                      <th>Column 1</th>
                      <th>Column 2</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Data 1</td>
                      <td>Data 2</td>
                    </tr>
                  </tbody>
                </table>`;
      
      case 'code':
        return `<pre><code>${content.text || '// Code here'}</code></pre>`;
      
      // ===========================
      // MEDIA
      // ===========================
      case 'image':
        return `<img src="${content.src || 'https://via.placeholder.com/400x200'}" 
                     alt="${content.alt || 'Image'}"
                     loading="lazy">`;
      
      case 'video':
        return `<video controls ${component.properties.attributes?.autoplay ? 'autoplay' : ''}>
                  <source src="${content.src || ''}" type="video/mp4">
                  Votre navigateur ne supporte pas la vidéo.
                </video>`;
      
      case 'icon':
        return `<span class="icon">${content.text || '⭐'}</span>`;
      
      case 'gallery':
        return this.renderContainer(component);
      
      // ===========================
      // CUSTOM
      // ===========================
      case 'card':
      case 'modal':
      case 'tabs':
      case 'accordion':
      case 'carousel':
        return this.renderContainer(component);
      
      default:
        return `<div class="unknown-component">${component.displayName}</div>`;
    }
  }
  
  /**
   * Génère le CSS inline pour un composant
   * 
   * @param styles - Styles du composant
   * @returns Style object pour [ngStyle]
   */
  generateStyleObject(styles: ComponentStyles): Record<string, any> {
    const styleObj: Record<string, any> = {};
    
    // Copier tous les styles définis
    Object.entries(styles).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convertir camelCase en kebab-case pour CSS
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        styleObj[cssKey] = value;
      }
    });
    
    return styleObj;
  }
  
  /**
   * Génère une string CSS pour un composant
   * 
   * @param styles - Styles du composant
   * @returns CSS string
   */
  generateCSSString(styles: ComponentStyles): string {
    const entries = Object.entries(styles)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      });
    
    return entries.join('; ');
  }
  
  /**
   * Détermine le niveau de heading (h1-h6)
   * 
   * @param component - Composant heading
   * @returns Niveau (1-6)
   */
  private getHeadingLevel(component: BuilderComponent): number {
    const fontSize = component.properties.styles.fontSize;
    
    if (!fontSize) return 2; // h2 par défaut
    
    // Extraire la valeur numérique
    const size = parseInt(fontSize);
    
    if (size >= 36) return 1;
    if (size >= 30) return 2;
    if (size >= 24) return 3;
    if (size >= 20) return 4;
    if (size >= 18) return 5;
    return 6;
  }
  
  /**
   * Rend un composant container avec ses enfants
   * 
   * @param component - Composant container
   * @returns HTML string
   */
  private renderContainer(component: BuilderComponent): string {
    const tag = this.getContainerTag(component.type);
    return `<${tag} class="component-container"></${tag}>`;
  }
  
  /**
   * Détermine le tag HTML pour un container
   * 
   * @param type - Type du composant
   * @returns Tag HTML
   */
  private getContainerTag(type: string): string {
    switch (type) {
      case 'section': return 'section';
      case 'card': return 'article';
      default: return 'div';
    }
  }
  
  /**
   * Vérifie si un composant est un container
   * 
   * @param component - Composant à vérifier
   * @returns true si container
   */
  isContainer(component: BuilderComponent): boolean {
    return !!component.children;
  }
  
  /**
   * Génère une classe CSS unique pour un composant
   * 
   * @param component - Composant
   * @returns Nom de classe
   */
  getComponentClass(component: BuilderComponent): string {
    return `component-${component.type}`;
  }
  
  /**
   * Génère des classes d'état pour un composant
   * 
   * @param component - Composant
   * @returns Classes CSS
   */
  getStateClasses(component: BuilderComponent): string[] {
    const classes: string[] = [];
    
    if (component.isLocked) classes.push('is-locked');
    if (component.isHidden) classes.push('is-hidden');
    if (component.isSelected) classes.push('is-selected');
    
    return classes;
  }
  
  /**
   * Obtient le contenu texte d'un composant
   * 
   * @param component - Composant
   * @returns Texte ou vide
   */
  getTextContent(component: BuilderComponent): string {
    return component.properties.content?.text || '';
  }
  
  /**
   * Vérifie si un composant a du contenu texte
   * 
   * @param component - Composant
   * @returns true si a du texte
   */
  hasTextContent(component: BuilderComponent): boolean {
    return !!component.properties.content?.text;
  }
  
  /**
   * Génère un aperçu du contenu pour les tooltips
   * 
   * @param component - Composant
   * @param maxLength - Longueur max
   * @returns Preview string
   */
  getContentPreview(component: BuilderComponent, maxLength: number = 50): string {
    const text = this.getTextContent(component);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}