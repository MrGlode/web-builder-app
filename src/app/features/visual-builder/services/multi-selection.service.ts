// src/app/features/visual-builder/services/multi-selection.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { BuilderComponent } from '../models/component.model';

/**
 * Mode de sélection
 */
export type SelectionMode = 'single' | 'multi' | 'range';

/**
 * Service gérant la multi-sélection de composants
 * Compatible avec VisualBuilderService
 */
@Injectable({
  providedIn: 'root'
})
export class MultiSelectionService {
  
  // ===== STATE =====
  
  /** IDs sélectionnés */
  private selectedIds = signal<Set<string>>(new Set());
  
  /** Dernier sélectionné (pour range) */
  private lastSelectedId = signal<string | null>(null);
  
  /** Pivot (premier de la range) */
  private pivotId = signal<string | null>(null);
  
  /** Mode actuel */
  private selectionMode = signal<SelectionMode>('single');
  
  // ===== COMPUTED =====
  
  /** Liste des IDs */
  selectedComponentIds = computed(() => Array.from(this.selectedIds()));
  
  /** Nombre de sélectionnés */
  selectionCount = computed(() => this.selectedIds().size);
  
  /** Multi-sélection active */
  hasMultipleSelection = computed(() => this.selectedIds().size > 1);
  
  /** Au moins un sélectionné */
  hasSelection = computed(() => this.selectedIds().size > 0);
  
  /** Mode actuel */
  currentMode = computed(() => this.selectionMode());
  
  /** ID pivot */
  pivotComponentId = computed(() => this.pivotId());
  
  // ===== PUBLIC METHODS =====
  
  /**
   * Sélectionne un composant
   */
  select(
    id: string, 
    mode: SelectionMode = 'single',
    allComponents?: BuilderComponent[]
  ): void {
    this.selectionMode.set(mode);
    
    switch (mode) {
      case 'single':
        this.selectSingle(id);
        break;
        
      case 'multi':
        this.toggleMulti(id);
        break;
        
      case 'range':
        if (allComponents) {
          this.selectRange(id, allComponents);
        }
        break;
    }
    
    console.log(`🎯 Selection: ${mode} - ${this.selectionCount()} selected`);
  }
  
  /**
   * Désélectionne un composant
   */
  deselect(id: string): void {
    const newSet = new Set(this.selectedIds());
    newSet.delete(id);
    this.selectedIds.set(newSet);
    
    if (this.lastSelectedId() === id) {
      this.lastSelectedId.set(null);
    }
    
    if (this.pivotId() === id) {
      // Si le pivot est désélectionné, utiliser le premier élément restant
      this.pivotId.set(newSet.size > 0 ? Array.from(newSet)[0] : null);
    }
  }
  
  /**
   * Désélectionne tous les composants
   */
  clearSelection(): void {
    this.selectedIds.set(new Set());
    this.lastSelectedId.set(null);
    this.pivotId.set(null);
    this.selectionMode.set('single');
  }
  
  /**
   * Vérifie si un composant est sélectionné
   */
  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }
  
  /**
   * Sélectionne tous les composants
   */
  selectAll(componentIds: string[]): void {
    this.selectedIds.set(new Set(componentIds));
    this.selectionMode.set('multi');
    
    if (componentIds.length > 0) {
      this.pivotId.set(componentIds[0]);
      this.lastSelectedId.set(componentIds[componentIds.length - 1]);
    }
  }
  
  /**
   * Obtient les composants sélectionnés depuis une liste
   */
  getSelectedComponents(allComponents: BuilderComponent[]): BuilderComponent[] {
    const selectedSet = this.selectedIds();
    return allComponents.filter(comp => selectedSet.has(comp.id));
  }
  
  // ===== PRIVATE METHODS =====
  
  /**
   * Sélection simple (remplace la sélection actuelle)
   */
  private selectSingle(id: string): void {
    this.selectedIds.set(new Set([id]));
    this.lastSelectedId.set(id);
    this.pivotId.set(id);
  }
  
  /**
   * Toggle la sélection d'un composant (Ctrl+Click)
   */
  private toggleMulti(id: string): void {
    const newSet = new Set(this.selectedIds());
    
    if (newSet.has(id)) {
      // Désélectionner
      newSet.delete(id);
      
      if (this.pivotId() === id && newSet.size > 0) {
        this.pivotId.set(Array.from(newSet)[0]);
      }
    } else {
      // Sélectionner
      newSet.add(id);
      
      if (newSet.size === 1) {
        this.pivotId.set(id);
      }
    }
    
    this.selectedIds.set(newSet);
    this.lastSelectedId.set(id);
  }
  
  /**
   * Sélection en plage (Shift+Click)
   */
  private selectRange(id: string, allComponents: BuilderComponent[]): void {
    const lastId = this.lastSelectedId() || this.pivotId();
    
    if (!lastId) {
      // Pas de sélection précédente, faire une sélection simple
      this.selectSingle(id);
      return;
    }
    
    // Trouver les indices
    const lastIndex = allComponents.findIndex(c => c.id === lastId);
    const currentIndex = allComponents.findIndex(c => c.id === id);
    
    if (lastIndex === -1 || currentIndex === -1) {
      return;
    }
    
    // Déterminer la plage
    const start = Math.min(lastIndex, currentIndex);
    const end = Math.max(lastIndex, currentIndex);
    
    // Sélectionner tous les composants dans la plage
    const newSet = new Set(this.selectedIds());
    for (let i = start; i <= end; i++) {
      newSet.add(allComponents[i].id);
    }
    
    this.selectedIds.set(newSet);
    this.lastSelectedId.set(id);
  }
}