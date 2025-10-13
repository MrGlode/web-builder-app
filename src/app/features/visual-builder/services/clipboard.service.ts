// src/app/features/visual-builder/services/clipboard.service.ts

import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { BuilderComponent } from '../models/component.model';
import { ComponentFactoryService } from './component-factory.service';

/**
 * Service gérant le copier/coller de composants
 */
@Injectable({
  providedIn: 'root'
})
export class ClipboardService {
  
  private componentFactory = inject(ComponentFactoryService);
  
  // ===== STATE =====
  
  /** Composants dans le clipboard */
  private clipboard = signal<BuilderComponent[]>([]);
  
  /** Indique si on coupe au lieu de copier */
  private isCutOperation = signal<boolean>(false);
  
  /** IDs des composants coupés (pour les supprimer après le paste) */
  private cutComponentIds = signal<string[]>([]);
  
  // ===== COMPUTED =====
  
  /** Indique si le clipboard contient des éléments */
  hasClipboard = computed(() => this.clipboard().length > 0);
  
  /** Nombre d'éléments dans le clipboard */
  clipboardCount = computed(() => this.clipboard().length);
  
  /** Indique si c'est une opération cut */
  isCut = computed(() => this.isCutOperation());
  
  /** IDs des composants coupés */
  cutIds = computed(() => this.cutComponentIds());
  
  // ===== EFFECTS =====
  
  constructor() {
    // Écoute les raccourcis clavier globaux
    this.setupKeyboardShortcuts();
  }
  
  // ===== PUBLIC METHODS =====
  
  /**
   * Copie un ou plusieurs composants dans le clipboard
   */
  copy(components: BuilderComponent | BuilderComponent[]): void {
    const componentsArray = Array.isArray(components) ? components : [components];
    
    // Clone profond des composants
    const clonedComponents = componentsArray.map(c => this.deepClone(c));
    
    this.clipboard.set(clonedComponents);
    this.isCutOperation.set(false);
    this.cutComponentIds.set([]);
    
    console.log(`📋 Copied ${clonedComponents.length} component(s)`);
  }
  
  /**
   * Coupe un ou plusieurs composants (copie + marquage pour suppression)
   */
  cut(components: BuilderComponent | BuilderComponent[]): void {
    const componentsArray = Array.isArray(components) ? components : [components];
    
    // Clone profond des composants
    const clonedComponents = componentsArray.map(c => this.deepClone(c));
    
    this.clipboard.set(clonedComponents);
    this.isCutOperation.set(true);
    this.cutComponentIds.set(componentsArray.map(c => c.id));
    
    console.log(`✂️ Cut ${clonedComponents.length} component(s)`);
  }
  
  /**
   * Colle les composants du clipboard
   * @returns Les nouveaux composants créés avec de nouveaux IDs
   */
  paste(): BuilderComponent[] {
    const components = this.clipboard();
    
    if (components.length === 0) {
      console.warn('⚠️ Clipboard is empty');
      return [];
    }
    
    // Crée de nouveaux composants avec de nouveaux IDs
    const pastedComponents = components.map(c => this.createWithNewIds(c));
    
    console.log(`📌 Pasted ${pastedComponents.length} component(s)`);
    
    // Si c'était un cut, on garde le clipboard pour permettre plusieurs pastes
    // mais on reset le flag cut
    if (this.isCutOperation()) {
      this.isCutOperation.set(false);
    }
    
    return pastedComponents;
  }
  
  /**
   * Duplique un composant (copie + paste immédiat)
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
    console.log('🗑️ Clipboard cleared');
  }
  
  /**
   * Obtient le contenu du clipboard (lecture seule)
   */
  getClipboardContent(): ReadonlyArray<BuilderComponent> {
    return this.clipboard();
  }
  
  // ===== PRIVATE METHODS =====
  
  /**
   * Clone profond un composant
   */
  private deepClone(component: BuilderComponent): BuilderComponent {
    return JSON.parse(JSON.stringify(component));
  }
  
  /**
   * Crée une copie du composant avec de nouveaux IDs
   */
  private createWithNewIds(component: BuilderComponent): BuilderComponent {
    // Génère un nouveau ID
    const newId = this.componentFactory.generateId();
    
    // Clone le composant
    const newComponent: BuilderComponent = {
      ...component,
      id: newId,
      properties: { ...component.properties }
    };
    
    // Si le composant a des enfants, génère aussi de nouveaux IDs pour eux
    if (component.children && component.children.length > 0) {
      newComponent.children = component.children.map(child => 
        this.createWithNewIds(child)
      );
    }
    
    return newComponent;
  }
  
  /**
   * Configure les raccourcis clavier globaux
   */
  private setupKeyboardShortcuts(): void {
    if (typeof window !== 'undefined') {
      // Note: Dans une vraie app, ces listeners seraient dans le composant
      // Pour éviter les conflits, on les documente ici mais on ne les active pas
      console.log('📌 Clipboard shortcuts available:');
      console.log('  - Ctrl+C : Copy selected component(s)');
      console.log('  - Ctrl+X : Cut selected component(s)');
      console.log('  - Ctrl+V : Paste component(s)');
      console.log('  - Ctrl+D : Duplicate selected component');
    }
  }
}