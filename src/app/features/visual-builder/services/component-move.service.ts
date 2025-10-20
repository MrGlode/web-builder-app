// src/app/features/visual-builder/services/component-move.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { BuilderComponent } from '../models/component.model';

/**
 * Information de drag en cours
 */
export interface DragInfo {
  componentId: string;
  component: BuilderComponent;
  sourceParentId: string | null;
  sourceIndex: number;
}

/**
 * Service gérant le déplacement de composants
 * Compatible avec VisualBuilderService existant
 */
@Injectable({
  providedIn: 'root'
})
export class ComponentMoveService {
  
  // ===== STATE =====
  
  /** Composant en cours de déplacement */
  private draggedComponent = signal<DragInfo | null>(null);
  
  /** Position de la souris */
  private mousePosition = signal<{ x: number; y: number } | null>(null);
  
  /** Zone de drop cible */
  private targetDropZone = signal<{ parentId: string | null; index: number } | null>(null);
  
  /** Validité du drop */
  private isValidDrop = signal<boolean>(false);
  
  // ===== COMPUTED =====
  
  /** Drag en cours */
  isDragging = computed(() => this.draggedComponent() !== null);
  
  /** Info du drag */
  currentDragInfo = computed(() => this.draggedComponent());
  
  /** Zone de drop */
  currentDropZone = computed(() => this.targetDropZone());
  
  /** Drop valide */
  canDrop = computed(() => this.isValidDrop());
  
  /** Position souris */
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
    
    console.log('🎯 Move: Drag started', {
      type: component.type,
      from: parentId || 'root',
      index
    });
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
   * Termine le drag et retourne les infos
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
    
    // Éviter le déplacement au même endroit
    if (dragInfo.sourceParentId === dropZone.parentId && 
        dragInfo.sourceIndex === dropZone.index) {
      console.log('⚠️ Move: Same location, cancelled');
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
    
    console.log('✅ Move: Drag completed', result);
    this.reset();
    
    return result;
  }
  
  /**
   * Annule le drag
   */
  cancelDrag(): void {
    console.log('❌ Move: Drag cancelled');
    this.reset();
  }
  
  /**
   * Valide un déplacement (évite les boucles)
   */
  validateDrop(
    component: BuilderComponent, 
    targetParentId: string | null, 
    allComponents: BuilderComponent[]
  ): boolean {
    // Drop au root toujours valide
    if (targetParentId === null) {
      return true;
    }
    
    // Vérifier qu'on ne drop pas dans un enfant de soi-même
    return !this.isDescendant(component.id, targetParentId, allComponents);
  }
  
  // ===== PRIVATE METHODS =====
  
  /**
   * Vérifie si targetId est un descendant de componentId
   */
  private isDescendant(
    componentId: string, 
    targetId: string, 
    allComponents: BuilderComponent[]
  ): boolean {
    const target = this.findComponentById(targetId, allComponents);
    
    if (!target) return false;
    if (target.id === componentId) return true;
    
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
   * Trouve un composant par ID
   */
  private findComponentById(
    id: string, 
    components: BuilderComponent[]
  ): BuilderComponent | null {
    for (const comp of components) {
      if (comp.id === id) return comp;
      
      if (comp.children && comp.children.length > 0) {
        const found = this.findComponentById(id, comp.children);
        if (found) return found;
      }
    }
    
    return null;
  }
  
  /**
   * Reset l'état
   */
  private reset(): void {
    this.draggedComponent.set(null);
    this.mousePosition.set(null);
    this.targetDropZone.set(null);
    this.isValidDrop.set(false);
  }
}