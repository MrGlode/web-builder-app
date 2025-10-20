// src/app/features/visual-builder/components/layer-manager/layer-manager.component.ts

import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayerGroupService } from '../../services/layer-group.service';
import { VisualBuilderService } from '../../services/visual-builder.service';
import { LayerGroup } from '../../models/layer-group.model';

@Component({
  selector: 'app-layer-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './layer-manager.component.html',
  styleUrls: ['./layer-manager.component.scss']
})
export class LayerManagerComponent {
  
  // ===== SERVICES =====
  
  private layerGroupService = inject(LayerGroupService);
  private builderService = inject(VisualBuilderService);
  
  // ===== STATE =====
  
  /** Mode édition pour renommer */
  editingLayerId = signal<string | null>(null);
  
  /** Nom en cours d'édition */
  editingName = signal<string>('');
  
  /** Layer en cours de drag */
  draggingLayerId = signal<string | null>(null);
  
  // ===== OUTPUTS =====
  
  /** Émis quand un calque est sélectionné pour filtrer */
  layerSelected = output<string | null>();
  
  // ===== COMPUTED =====
  
  /** Tous les calques */
  layers = this.layerGroupService.visibleLayerGroups;
  
  /** Calque sélectionné */
  selectedLayer = this.layerGroupService.selectedLayer;
  
  /** Configuration de vue */
  viewConfig = this.layerGroupService.currentViewConfig;
  
  /** Composants du builder */
  components = this.builderService.allComponents;
  
  /** Statistiques des calques */
  layersStats = computed(() => 
    this.layerGroupService.getAllLayersStats(this.components())
  );
  
  // ===== MÉTHODES - CRÉATION =====
  
  /**
   * Crée un nouveau calque
   */
  createNewLayer(): void {
    const layer = this.layerGroupService.createLayer();
    this.layerGroupService.selectLayer(layer.id);
    
    // Passer en mode édition
    this.startEditing(layer.id, layer.name);
  }
  
  /**
   * Crée un calque avec un nom spécifique
   */
  createNamedLayer(name: string): void {
    const layer = this.layerGroupService.createLayer({ name });
    this.layerGroupService.selectLayer(layer.id);
  }
  
  // ===== MÉTHODES - SÉLECTION =====
  
  /**
   * Sélectionne un calque
   */
  selectLayer(layerId: string | null): void {
    this.layerGroupService.selectLayer(layerId);
    this.layerSelected.emit(layerId);
  }
  
  /**
   * Vérifie si un calque est sélectionné
   */
  isLayerSelected(layerId: string): boolean {
    return this.selectedLayer()?.id === layerId;
  }
  
  // ===== MÉTHODES - ACTIONS =====
  
  /**
   * Toggle la visibilité d'un calque
   */
  toggleVisibility(layerId: string, event: Event): void {
    event.stopPropagation();
    this.layerGroupService.toggleVisibility(layerId);
  }
  
  /**
   * Toggle le verrouillage d'un calque
   */
  toggleLock(layerId: string, event: Event): void {
    event.stopPropagation();
    this.layerGroupService.toggleLock(layerId);
  }
  
  /**
   * Change l'opacité d'un calque
   */
  changeOpacity(layerId: string, opacity: number): void {
    this.layerGroupService.setOpacity(layerId, opacity);
  }
  
  /**
   * Supprime un calque
   */
  deleteLayer(layerId: string, event: Event): void {
    event.stopPropagation();
    
    const layer = this.layerGroupService.getLayer(layerId);
    if (!layer) return;
    
    // Vérifier s'il y a des composants dans ce calque
    const stats = this.layersStats().find(s => s.layerId === layerId);
    if (stats && stats.componentCount > 0) {
      const confirmed = confirm(
        `Le calque "${layer.name}" contient ${stats.componentCount} composant(s). ` +
        `Les composants seront déplacés vers le calque par défaut. Continuer ?`
      );
      if (!confirmed) return;
    }
    
    this.layerGroupService.deleteLayer(layerId);
  }
  
  /**
   * Duplique un calque
   */
  duplicateLayer(layerId: string, event: Event): void {
    event.stopPropagation();
    this.layerGroupService.duplicateLayer(layerId);
  }
  
  // ===== MÉTHODES - ÉDITION =====
  
  /**
   * Démarre l'édition du nom d'un calque
   */
  startEditing(layerId: string, currentName: string): void {
    this.editingLayerId.set(layerId);
    this.editingName.set(currentName);
  }
  
  /**
   * Sauvegarde le nouveau nom
   */
  saveEditing(): void {
    const layerId = this.editingLayerId();
    const newName = this.editingName().trim();
    
    if (layerId && newName) {
      this.layerGroupService.renameLayer(layerId, newName);
    }
    
    this.cancelEditing();
  }
  
  /**
   * Annule l'édition
   */
  cancelEditing(): void {
    this.editingLayerId.set(null);
    this.editingName.set('');
  }
  
  /**
   * Vérifie si un calque est en édition
   */
  isEditing(layerId: string): boolean {
    return this.editingLayerId() === layerId;
  }
  
  /**
   * Gère le double-clic pour renommer
   */
  onLayerDoubleClick(layer: LayerGroup, event: Event): void {
    event.stopPropagation();
    if (!layer.isLocked) {
      this.startEditing(layer.id, layer.name);
    }
  }
  
  // ===== MÉTHODES - DRAG & DROP =====
  
  /**
   * Démarre le drag d'un calque
   */
  onDragStart(layerId: string, event: DragEvent): void {
    this.draggingLayerId.set(layerId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('layerId', layerId);
    }
  }
  
  /**
   * Gère le drop pour réordonner
   */
  onDrop(targetLayerId: string, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const draggedId = this.draggingLayerId();
    if (!draggedId || draggedId === targetLayerId) {
      this.draggingLayerId.set(null);
      return;
    }
    
    // Trouver l'ordre du calque cible
    const targetLayer = this.layerGroupService.getLayer(targetLayerId);
    if (targetLayer) {
      this.layerGroupService.reorderLayers(draggedId, targetLayer.order);
    }
    
    this.draggingLayerId.set(null);
  }
  
  /**
   * Permet le drop
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }
  
  /**
   * Fin du drag
   */
  onDragEnd(): void {
    this.draggingLayerId.set(null);
  }
  
  // ===== MÉTHODES - STATISTIQUES =====
  
  /**
   * Obtient les statistiques d'un calque
   */
  getLayerStats(layerId: string) {
    return this.layersStats().find(s => s.layerId === layerId) || {
      layerId,
      componentCount: 0,
      visibleCount: 0,
      lockedCount: 0
    };
  }
  
  /**
   * Obtient le nombre de composants dans un calque
   */
  getComponentCount(layerId: string): number {
    return this.getLayerStats(layerId).componentCount;
  }
  
  // ===== MÉTHODES - UTILITAIRES =====
  
  /**
   * Obtient l'icône selon l'état du calque
   */
  getLayerIcon(layer: LayerGroup): string {
    if (layer.isLocked) return '🔒';
    if (!layer.isVisible) return '👁️‍🗨️';
    return '📄';
  }
  
  /**
   * Obtient la classe CSS selon l'état
   */
  getLayerClass(layer: LayerGroup): string {
    const classes = ['layer-item'];
    
    if (this.isLayerSelected(layer.id)) classes.push('selected');
    if (!layer.isVisible) classes.push('hidden');
    if (layer.isLocked) classes.push('locked');
    if (this.draggingLayerId() === layer.id) classes.push('dragging');
    
    return classes.join(' ');
  }
}