// src/app/features/visual-builder/services/layers.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { LayerState, LayersViewOptions } from '../models/layer.model';

@Injectable({
  providedIn: 'root'
})
export class LayersService {
  
  // État des layers (expanded, visible, locked)
  private layerStates = signal<Map<string, LayerState>>(new Map());
  
  // Options de vue
  private viewOptions = signal<LayersViewOptions>({
    showHidden: true,
    showLocked: true,
    autoExpand: true,
    sortMode: 'order'
  });

  // Signals computés
  allLayerStates = computed(() => this.layerStates());
  currentViewOptions = computed(() => this.viewOptions());

  /**
   * Obtient l'état d'un layer
   */
  getLayerState(componentId: string): LayerState {
    const states = this.layerStates();
    
    if (states.has(componentId)) {
      return states.get(componentId)!;
    }
    
    // État par défaut
    return {
      id: componentId,
      isExpanded: false,
      isVisible: true,
      isLocked: false
    };
  }

  /**
   * Met à jour l'état d'un layer
   */
  updateLayerState(componentId: string, updates: Partial<LayerState>): void {
    const states = this.layerStates();
    const currentState = this.getLayerState(componentId);
    const newState = { ...currentState, ...updates };
    
    states.set(componentId, newState);
    this.layerStates.set(new Map(states));
  }

  /**
   * Toggle l'expansion d'un layer
   */
  toggleExpanded(componentId: string): void {
    const state = this.getLayerState(componentId);
    this.updateLayerState(componentId, {
      isExpanded: !state.isExpanded
    });
  }

  /**
   * Toggle la visibilité d'un layer
   */
  toggleVisibility(componentId: string): void {
    const state = this.getLayerState(componentId);
    this.updateLayerState(componentId, {
      isVisible: !state.isVisible
    });
  }

  /**
   * Toggle le verrouillage d'un layer
   */
  toggleLock(componentId: string): void {
    const state = this.getLayerState(componentId);
    this.updateLayerState(componentId, {
      isLocked: !state.isLocked
    });
  }

  /**
   * Expand un layer et tous ses parents
   */
  expandToComponent(componentId: string, parentIds: string[]): void {
    // Expand tous les parents
    parentIds.forEach(parentId => {
      this.updateLayerState(parentId, { isExpanded: true });
    });
    
    // Expand le composant lui-même s'il a des enfants
    this.updateLayerState(componentId, { isExpanded: true });
  }

  /**
   * Collapse tous les layers
   */
  collapseAll(): void {
    const states = this.layerStates();
    states.forEach((state, id) => {
      states.set(id, { ...state, isExpanded: false });
    });
    this.layerStates.set(new Map(states));
  }

  /**
   * Expand tous les layers
   */
  expandAll(): void {
    const states = this.layerStates();
    states.forEach((state, id) => {
      states.set(id, { ...state, isExpanded: true });
    });
    this.layerStates.set(new Map(states));
  }

  /**
   * Met à jour les options de vue
   */
  updateViewOptions(options: Partial<LayersViewOptions>): void {
    this.viewOptions.update(current => ({ ...current, ...options }));
  }

  /**
   * Efface tous les états
   */
  clear(): void {
    this.layerStates.set(new Map());
  }

  /**
   * Réinitialise un layer à son état par défaut
   */
  resetLayerState(componentId: string): void {
    const states = this.layerStates();
    states.delete(componentId);
    this.layerStates.set(new Map(states));
  }
}