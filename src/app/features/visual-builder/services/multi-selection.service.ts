// src/app/features/visual-builder/services/multi-selection.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { BuilderComponent } from '../models/component.model';

/**
 * Mode de sélection
 */
export type SelectionMode = 'single' | 'multi' | 'range';

/**
 * Service gérant la sélection multiple de composants
 */
@Injectable({
  providedIn: 'root'
})
export class MultiSelectionService {
  
  // ===== STATE =====
  
  /** IDs des composants sélectionnés */
  private selectedIds = signal<Set<string>>(new Set());
  
  /** ID du dernier composant sélectionné (pour range selection) */
  private lastSelectedId = signal<string | null>(null);
  
  /** ID du composant pivot pour la sélection (premier sélectionné) */
  private pivotId = signal<string | null>(null);
  
  /** Mode de sélection actuel */
  private selectionMode = signal<SelectionMode>('single');
  
  // ===== COMPUTED =====
  
  /** Liste des IDs sélectionnés */
  selectedComponentIds = computed(() => Array.from(this.selectedIds()));
  
  /** Nombre de composants sélectionnés */
  selectionCount = computed(() => this.selectedIds().size);
  
  /** Indique si plusieurs composants sont sélectionnés */
  hasMultipleSelection = computed(() => this.selectedIds().size > 1);
  
  /** Indique si au moins un composant est sélectionné */
  hasSelection = computed(() => this.selectedIds().size > 0);
  
  /** Obtient le mode de sélection */
  currentMode = computed(() => this.selectionMode());
  
  /** Obtient l'ID du pivot */
  pivotComponentId = computed(() => this.pivotId());
  
  // ===== PUBLIC METHODS =====
  
  /**
   * Sélectionne un composant
   * @param id ID du composant
   * @param mode Mode de sélection (single, multi, range)
   * @param allComponents Liste de tous les composants (pour range selection)
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
  selectAll(components: BuilderComponent[]): void {
    const allIds = this.getAllComponentIds(components);
    this.selectedIds.set(new Set(allIds));
    this.selectionMode.set('multi');
    
    if (allIds.length > 0) {
      this.pivotId.set(allIds[0]);
      this.lastSelectedId.set(allIds[allIds.length - 1]);
    }
  }
  
  /**
   * Inverse la sélection
   */
  invertSelection(allComponents: BuilderComponent[], currentSelection: string[]): void {
    const allIds = this.getAllComponentIds(allComponents);
    const currentSet = new Set(currentSelection);
    const invertedIds = allIds.filter(id => !currentSet.has(id));
    
    this.selectedIds.set(new Set(invertedIds));
    this.selectionMode.set('multi');
    
    if (invertedIds.length > 0) {
      this.pivotId.set(invertedIds[0]);
      this.lastSelectedId.set(invertedIds[invertedIds.length - 1]);
    }
  }
  
  /**
   * Sélectionne les composants dans une zone rectangulaire
   */
  selectInRect(
    rect: { x: number; y: number; width: number; height: number },
    components: BuilderComponent[],
    componentPositions: Map<string, { x: number; y: number; width: number; height: number }>
  ): void {
    const idsInRect: string[] = [];
    
    components.forEach(comp => {
      const pos = componentPositions.get(comp.id);
      if (pos && this.isInRect(pos, rect)) {
        idsInRect.push(comp.id);
      }
    });
    
    this.selectedIds.set(new Set(idsInRect));
    this.selectionMode.set('multi');
    
    if (idsInRect.length > 0) {
      this.pivotId.set(idsInRect[0]);
      this.lastSelectedId.set(idsInRect[idsInRect.length - 1]);
    }
  }
  
  /**
   * Obtient les composants sélectionnés
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
   * Sélection multiple (toggle)
   */
  private toggleMulti(id: string): void {
    const newSet = new Set(this.selectedIds());
    
    if (newSet.has(id)) {
      newSet.delete(id);
      if (this.lastSelectedId() === id) {
        this.lastSelectedId.set(newSet.size > 0 ? Array.from(newSet)[0] : null);
      }
      if (this.pivotId() === id) {
        this.pivotId.set(newSet.size > 0 ? Array.from(newSet)[0] : null);
      }
    } else {
      newSet.add(id);
      this.lastSelectedId.set(id);
      
      // Si c'est le premier élément sélectionné, il devient le pivot
      if (newSet.size === 1) {
        this.pivotId.set(id);
      }
    }
    
    this.selectedIds.set(newSet);
  }
  
  /**
   * Sélection en range (du pivot au composant cliqué)
   */
  private selectRange(id: string, allComponents: BuilderComponent[]): void {
    const pivot = this.pivotId();
    
    if (!pivot) {
      // Pas de pivot, sélection simple
      this.selectSingle(id);
      return;
    }
    
    const allIds = this.getAllComponentIds(allComponents);
    const pivotIndex = allIds.indexOf(pivot);
    const targetIndex = allIds.indexOf(id);
    
    if (pivotIndex === -1 || targetIndex === -1) {
      return;
    }
    
    // Sélectionne tous les éléments entre pivot et target
    const start = Math.min(pivotIndex, targetIndex);
    const end = Math.max(pivotIndex, targetIndex);
    const rangeIds = allIds.slice(start, end + 1);
    
    this.selectedIds.set(new Set(rangeIds));
    this.lastSelectedId.set(id);
  }
  
  /**
   * Récupère tous les IDs de composants de manière récursive
   */
  private getAllComponentIds(components: BuilderComponent[]): string[] {
    const ids: string[] = [];
    
    const traverse = (comps: BuilderComponent[]) => {
      comps.forEach(comp => {
        ids.push(comp.id);
        if (comp.children && comp.children.length > 0) {
          traverse(comp.children);
        }
      });
    };
    
    traverse(components);
    return ids;
  }
  
  /**
   * Vérifie si une position est dans un rectangle
   */
  private isInRect(
    pos: { x: number; y: number; width: number; height: number },
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      pos.x + pos.width < rect.x ||
      pos.x > rect.x + rect.width ||
      pos.y + pos.height < rect.y ||
      pos.y > rect.y + rect.height
    );
  }
}