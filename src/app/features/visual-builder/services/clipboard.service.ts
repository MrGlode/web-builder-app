// src/app/features/visual-builder/services/clipboard.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { BuilderComponent } from '../models/component.model';

/**
 * Service gérant le copier/coller de composants
 * Compatible avec ComponentFactoryService existant
 */
@Injectable({
  providedIn: 'root'
})
export class ClipboardService {
  
  // ===== STATE =====
  
  /** Composants dans le clipboard */
  private clipboard = signal<BuilderComponent[]>([]);
  
  /** Type d'opération (copy ou cut) */
  private isCutOperation = signal<boolean>(false);
  
  /** IDs des composants coupés */
  private cutComponentIds = signal<string[]>([]);
  
  // ===== COMPUTED =====
  
  /** Clipboard a du contenu */
  hasClipboard = computed(() => this.clipboard().length > 0);
  
  /** Nombre d'éléments */
  clipboardCount = computed(() => this.clipboard().length);
  
  /** Est une opération cut */
  isCut = computed(() => this.isCutOperation());
  
  /** IDs coupés */
  cutIds = computed(() => this.cutComponentIds());
  
  // ===== PUBLIC METHODS =====
  
  /**
   * Copie un ou plusieurs composants
   */
  copy(components: BuilderComponent | BuilderComponent[]): void {
    const componentsArray = Array.isArray(components) ? components : [components];
    
    // Clone profond
    const cloned = componentsArray.map(c => this.deepClone(c));
    
    this.clipboard.set(cloned);
    this.isCutOperation.set(false);
    this.cutComponentIds.set([]);
    
    console.log(`📋 Clipboard: Copied ${cloned.length} component(s)`);
  }
  
  /**
   * Coupe un ou plusieurs composants
   */
  cut(components: BuilderComponent | BuilderComponent[]): void {
    const componentsArray = Array.isArray(components) ? components : [components];
    
    // Clone profond
    const cloned = componentsArray.map(c => this.deepClone(c));
    
    this.clipboard.set(cloned);
    this.isCutOperation.set(true);
    this.cutComponentIds.set(componentsArray.map(c => c.id));
    
    console.log(`✂️ Clipboard: Cut ${cloned.length} component(s)`);
  }
  
  /**
   * Colle les composants du clipboard
   * Génère de nouveaux IDs
   */
  paste(): BuilderComponent[] {
    const components = this.clipboard();
    
    if (components.length === 0) {
      console.warn('⚠️ Clipboard: Empty');
      return [];
    }
    
    // Créer avec nouveaux IDs
    const pasted = components.map(c => this.createWithNewIds(c));
    
    console.log(`📌 Clipboard: Pasted ${pasted.length} component(s)`);
    
    // Reset le flag cut après paste
    if (this.isCutOperation()) {
      this.isCutOperation.set(false);
    }
    
    return pasted;
  }
  
  /**
   * Duplique un composant (copy + paste immédiat)
   */
  duplicate(component: BuilderComponent): BuilderComponent {
    const cloned = this.deepClone(component);
    return this.createWithNewIds(cloned);
  }
  
  /**
   * Vide le clipboard
   */
  clear(): void {
    this.clipboard.set([]);
    this.isCutOperation.set(false);
    this.cutComponentIds.set([]);
    console.log('🗑️ Clipboard: Cleared');
  }
  
  /**
   * Obtient le contenu (read-only)
   */
  getClipboardContent(): ReadonlyArray<BuilderComponent> {
    return this.clipboard();
  }
  
  // ===== PRIVATE METHODS =====
  
  /**
   * Clone profond
   */
  private deepClone(component: BuilderComponent): BuilderComponent {
    return JSON.parse(JSON.stringify(component));
  }
  
  /**
   * Crée une copie avec nouveaux IDs
   */
  private createWithNewIds(component: BuilderComponent): BuilderComponent {
    // Génère un ID unique
    const newId = this.generateId(component.type);
    
    // Clone le composant
    const newComponent: BuilderComponent = {
      ...component,
      id: newId,
      // Garder le même order initialement
      order: component.order,
      // Reset les états
      isSelected: false,
      isLocked: false,
      isHidden: false
    };
    
    // Traiter les enfants récursivement
    if (component.children && component.children.length > 0) {
      newComponent.children = component.children.map(child => 
        this.createWithNewIds(child)
      );
    }
    
    return newComponent;
  }
  
  /**
   * Génère un ID unique
   */
  private generateId(type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${type}_${timestamp}_${random}`;
  }
}