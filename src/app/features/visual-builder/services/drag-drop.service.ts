// src/app/features/visual-builder/services/drag-drop.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { ComponentType } from '../models/component.model';

/**
 * Service centralisé pour gérer le Drag & Drop dans le Visual Builder
 */
@Injectable({
  providedIn: 'root'
})
export class DragDropService {
  
  // ===== STATE =====
  
  /** Indique si un drag est en cours */
  private isDragging = signal(false);
  
  /** Type de composant en cours de drag */
  private draggedComponentType = signal<ComponentType | null>(null);
  
  /** ID du composant source (si c'est un déplacement) */
  private draggedComponentId = signal<string | null>(null);
  
  /** Position de la souris pendant le drag */
  private dragPosition = signal<{ x: number; y: number } | null>(null);
  
  // ===== COMPUTED =====
  
  /** Expose l'état de drag */
  dragging = computed(() => this.isDragging());
  
  /** Expose le type de composant dragué */
  draggedType = computed(() => this.draggedComponentType());
  
  /** Expose l'ID du composant dragué (si déplacement) */
  draggedId = computed(() => this.draggedComponentId());
  
  /** Indique si c'est un nouveau composant (depuis la palette) */
  isNewComponent = computed(() => {
    return this.isDragging() && !this.draggedComponentId() && !!this.draggedComponentType();
  });
  
  /** Indique si c'est un déplacement de composant existant */
  isMovingComponent = computed(() => {
    return this.isDragging() && !!this.draggedComponentId();
  });
  
  // ===== MÉTHODES =====
  
  /**
   * Démarre un drag depuis la palette (nouveau composant)
   */
  startDragFromPalette(componentType: ComponentType) {
    console.log('🎯 Start drag from palette:', componentType);
    this.isDragging.set(true);
    this.draggedComponentType.set(componentType);
    this.draggedComponentId.set(null);
  }
  
  /**
   * Démarre un drag d'un composant existant (déplacement)
   */
  startDragFromCanvas(componentId: string, componentType: ComponentType) {
    console.log('🎯 Start drag from canvas:', componentId);
    this.isDragging.set(true);
    this.draggedComponentType.set(componentType);
    this.draggedComponentId.set(componentId);
  }
  
  /**
   * Met à jour la position du curseur pendant le drag
   */
  updateDragPosition(x: number, y: number) {
    this.dragPosition.set({ x, y });
  }
  
  /**
   * Termine le drag avec succès (drop)
   */
  endDrag() {
    console.log('✅ End drag');
    this.resetState();
  }
  
  /**
   * Annule le drag (pas de drop valide)
   */
  cancelDrag() {
    console.log('❌ Cancel drag');
    this.resetState();
  }
  
  /**
   * Réinitialise l'état du service
   */
  private resetState() {
    this.isDragging.set(false);
    this.draggedComponentType.set(null);
    this.draggedComponentId.set(null);
    this.dragPosition.set(null);
  }
  
  /**
   * Obtient les informations actuelles du drag
   */
  getDragInfo() {
    return {
      isDragging: this.isDragging(),
      componentType: this.draggedComponentType(),
      componentId: this.draggedComponentId(),
      position: this.dragPosition(),
      isNew: this.isNewComponent(),
      isMoving: this.isMovingComponent()
    };
  }
}