// src/app/features/visual-builder/services/component-move.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { BuilderComponent } from '../models/component.model';

/**
 * Interface pour les informations de drag en cours
 */
export interface DragInfo {
  componentId: string;
  component: BuilderComponent;
  sourceParentId: string | null;
  sourceIndex: number;
}

/**
 * Service gérant le déplacement de composants dans le canvas
 */
@Injectable({
  providedIn: 'root'
})
export class ComponentMoveService {
  
  // ===== STATE =====
  
  /** Composant en cours de déplacement */
  private draggedComponent = signal<DragInfo | null>(null);
  
  /** Position de la souris pendant le drag */
  private mousePosition = signal<{ x: number; y: number } | null>(null);
  
  /** Zone de drop cible actuelle */
  private targetDropZone = signal<{ parentId: string | null; index: number } | null>(null);
  
  /** Indique si le drag est valide */
  private isValidDrop = signal<boolean>(false);
  
  // ===== COMPUTED =====
  
  /** Indique si un drag est en cours */
  isDragging = computed(() => this.draggedComponent() !== null);
  
  /** Obtient le composant en cours de drag */
  currentDragInfo = computed(() => this.draggedComponent());
  
  /** Obtient la zone de drop cible */
  currentDropZone = computed(() => this.targetDropZone());
  
  /** Vérifie si le drop est valide */
  canDrop = computed(() => this.isValidDrop());
  
  /** Position de la souris */
  currentMousePosition = computed(() => this.mousePosition());
  
  // ===== PUBLIC METHODS =====
  
  /**
   * Démarre le drag d'un composant existant
   */
  startDrag(component: BuilderComponent, parentId: string | null, index: number): void {
    this.draggedComponent.set({
      componentId: component.id,
      component: component,
      sourceParentId: parentId,
      sourceIndex: index
    });
    
    console.log('🎯 Drag started:', component.type, 'from index', index);
  }
  
  /**
   * Met à jour la position de la souris
   */
  updateMousePosition(x: number, y: number): void {
    this.mousePosition.set({ x, y });
  }
  
  /**
   * Met à jour la zone de drop cible
   */
  updateDropZone(parentId: string | null, index: number, isValid: boolean = true): void {
    this.targetDropZone.set({ parentId, index });
    this.isValidDrop.set(isValid);
  }
  
  /**
   * Termine le drag et retourne les informations de déplacement
   */
  endDrag(): { 
    component: BuilderComponent; 
    sourceParentId: string | null; 
    sourceIndex: number;
    targetParentId: string | null;
    targetIndex: number;
  } | null {
    const dragInfo = this.draggedComponent();
    const dropZone = this.targetDropZone();
    const valid = this.isValidDrop();
    
    if (!dragInfo || !dropZone || !valid) {
      this.reset();
      return null;
    }
    
    const result = {
      component: dragInfo.component,
      sourceParentId: dragInfo.sourceParentId,
      sourceIndex: dragInfo.sourceIndex,
      targetParentId: dropZone.parentId,
      targetIndex: dropZone.index
    };
    
    console.log('✅ Drag ended:', result);
    this.reset();
    
    return result;
  }
  
  /**
   * Annule le drag en cours
   */
  cancelDrag(): void {
    console.log('❌ Drag cancelled');
    this.reset();
  }
  
  /**
   * Vérifie si le déplacement est valide (pas dans un enfant de soi-même)
   */
  validateDrop(component: BuilderComponent, targetParentId: string | null, allComponents: BuilderComponent[]): boolean {
    // Si on drop au même endroit, ce n'est pas valide
    const dragInfo = this.draggedComponent();
    if (dragInfo && 
        dragInfo.sourceParentId === targetParentId) {
      return false;
    }
    
    // Si targetParentId est null (root), c'est valide
    if (targetParentId === null) {
      return true;
    }
    
    // Vérifie qu'on ne drop pas dans un de ses propres enfants
    return !this.isDescendant(component.id, targetParentId, allComponents);
  }
  
  // ===== PRIVATE METHODS =====
  
  /**
   * Vérifie si targetId est un descendant de componentId
   */
  private isDescendant(componentId: string, targetId: string, allComponents: BuilderComponent[]): boolean {
    const target = allComponents.find(c => c.id === targetId);
    
    if (!target) {
      return false;
    }
    
    // Si le target est le composant lui-même
    if (target.id === componentId) {
      return true;
    }
    
    // Vérifie les enfants du target
    if (target.children && target.children.length > 0) {
      for (const child of target.children) {
        if (this.isDescendant(componentId, child.id, allComponents)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Réinitialise l'état du service
   */
  private reset(): void {
    this.draggedComponent.set(null);
    this.mousePosition.set(null);
    this.targetDropZone.set(null);
    this.isValidDrop.set(false);
  }
}