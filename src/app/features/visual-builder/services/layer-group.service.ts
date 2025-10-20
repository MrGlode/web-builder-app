// src/app/features/visual-builder/services/layer-group.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { LayerGroup, LayerGroupStats, LayerGroupsViewConfig, CreateLayerOptions } from '../models/layer-group.model';
import { BuilderComponent } from '../models/component.model';

@Injectable({
  providedIn: 'root'
})
export class LayerGroupService {
  
  // ===== STATE =====
  
  /** Liste des calques */
  private layerGroups = signal<LayerGroup[]>([]);
  
  /** ID du calque sélectionné */
  private selectedLayerId = signal<string | null>(null);
  
  /** Configuration d'affichage */
  private viewConfig = signal<LayerGroupsViewConfig>({
    showHiddenLayers: true,
    showLockedLayers: true,
    showComponentCount: true,
    sortMode: 'order'
  });
  
  // ===== COMPUTED =====
  
  /** Tous les calques */
  allLayerGroups = computed(() => this.layerGroups());
  
  /** Calques triés selon la configuration */
  sortedLayerGroups = computed(() => {
    const layers = [...this.layerGroups()];
    const mode = this.viewConfig().sortMode;
    
    switch (mode) {
      case 'name':
        return layers.sort((a, b) => a.name.localeCompare(b.name));
      case 'created':
        return layers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'order':
      default:
        return layers.sort((a, b) => a.order - b.order);
    }
  });
  
  /** Calques visibles (selon config) */
  visibleLayerGroups = computed(() => {
    const config = this.viewConfig();
    return this.sortedLayerGroups().filter(layer => {
      if (!config.showHiddenLayers && !layer.isVisible) return false;
      if (!config.showLockedLayers && layer.isLocked) return false;
      return true;
    });
  });
  
  /** ID du calque sélectionné */
  selectedLayer = computed(() => {
    const id = this.selectedLayerId();
    return id ? this.layerGroups().find(l => l.id === id) : null;
  });
  
  /** Configuration de vue */
  currentViewConfig = computed(() => this.viewConfig());
  
  // ===== MÉTHODES - CRUD =====
  
  /**
   * Crée un nouveau calque
   */
  createLayer(options: CreateLayerOptions = {}): LayerGroup {
    const layers = this.layerGroups();
    const now = new Date();
    
    const newLayer: LayerGroup = {
      id: this.generateId(),
      name: options.name || `Layer ${layers.length + 1}`,
      color: options.color || this.generateRandomColor(),
      order: options.order ?? layers.length,
      isVisible: options.isVisible ?? true,
      isLocked: options.isLocked ?? false,
      opacity: 100,
      createdAt: now,
      updatedAt: now
    };
    
    this.layerGroups.set([...layers, newLayer]);
    console.log('✅ Calque créé:', newLayer.name);
    
    return newLayer;
  }
  
  /**
   * Supprime un calque
   */
  deleteLayer(layerId: string): boolean {
    const layers = this.layerGroups();
    const index = layers.findIndex(l => l.id === layerId);
    
    if (index === -1) {
      console.warn('⚠️ Calque non trouvé:', layerId);
      return false;
    }
    
    const newLayers = layers.filter(l => l.id !== layerId);
    this.layerGroups.set(newLayers);
    
    // Désélectionner si c'était le calque sélectionné
    if (this.selectedLayerId() === layerId) {
      this.selectedLayerId.set(null);
    }
    
    console.log('🗑️ Calque supprimé:', layers[index].name);
    return true;
  }
  
  /**
   * Met à jour un calque
   */
  updateLayer(layerId: string, updates: Partial<LayerGroup>): boolean {
    const layers = this.layerGroups();
    const index = layers.findIndex(l => l.id === layerId);
    
    if (index === -1) {
      console.warn('⚠️ Calque non trouvé:', layerId);
      return false;
    }
    
    const updatedLayers = [...layers];
    updatedLayers[index] = {
      ...updatedLayers[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.layerGroups.set(updatedLayers);
    console.log('✏️ Calque mis à jour:', updatedLayers[index].name);
    
    return true;
  }
  
  /**
   * Renomme un calque
   */
  renameLayer(layerId: string, newName: string): boolean {
    return this.updateLayer(layerId, { name: newName });
  }
  
  // ===== MÉTHODES - ACTIONS =====
  
  /**
   * Toggle la visibilité d'un calque
   */
  toggleVisibility(layerId: string): boolean {
    const layer = this.layerGroups().find(l => l.id === layerId);
    if (!layer) return false;
    
    return this.updateLayer(layerId, { isVisible: !layer.isVisible });
  }
  
  /**
   * Toggle le verrouillage d'un calque
   */
  toggleLock(layerId: string): boolean {
    const layer = this.layerGroups().find(l => l.id === layerId);
    if (!layer) return false;
    
    return this.updateLayer(layerId, { isLocked: !layer.isLocked });
  }
  
  /**
   * Change l'opacité d'un calque
   */
  setOpacity(layerId: string, opacity: number): boolean {
    const clampedOpacity = Math.max(0, Math.min(100, opacity));
    return this.updateLayer(layerId, { opacity: clampedOpacity });
  }
  
  /**
   * Réordonne les calques
   */
  reorderLayers(layerId: string, newOrder: number): boolean {
    const layers = this.layerGroups();
    const layer = layers.find(l => l.id === layerId);
    
    if (!layer) return false;
    
    // Recalculer tous les ordres
    const reordered = layers
      .filter(l => l.id !== layerId)
      .map(l => ({
        ...l,
        order: l.order >= newOrder ? l.order + 1 : l.order
      }));
    
    reordered.push({ ...layer, order: newOrder });
    
    this.layerGroups.set(reordered);
    return true;
  }
  
  // ===== MÉTHODES - SÉLECTION =====
  
  /**
   * Sélectionne un calque
   */
  selectLayer(layerId: string | null): void {
    this.selectedLayerId.set(layerId);
  }
  
  /**
   * Obtient un calque par son ID
   */
  getLayer(layerId: string): LayerGroup | undefined {
    return this.layerGroups().find(l => l.id === layerId);
  }
  
  /**
   * Vérifie si un calque existe
   */
  hasLayer(layerId: string): boolean {
    return this.layerGroups().some(l => l.id === layerId);
  }
  
  // ===== MÉTHODES - STATISTIQUES =====
  
  /**
   * Obtient les statistiques d'un calque
   */
  getLayerStats(layerId: string, components: BuilderComponent[]): LayerGroupStats {
    const componentsInLayer = components.filter(c => c.layerId === layerId);
    
    return {
      layerId,
      componentCount: componentsInLayer.length,
      visibleCount: componentsInLayer.filter(c => !c.isHidden).length,
      lockedCount: componentsInLayer.filter(c => c.isLocked).length
    };
  }
  
  /**
   * Obtient les statistiques de tous les calques
   */
  getAllLayersStats(components: BuilderComponent[]): LayerGroupStats[] {
    return this.layerGroups().map(layer => 
      this.getLayerStats(layer.id, components)
    );
  }
  
  // ===== MÉTHODES - CONFIGURATION =====
  
  /**
   * Met à jour la configuration d'affichage
   */
  updateViewConfig(updates: Partial<LayerGroupsViewConfig>): void {
    this.viewConfig.update(config => ({ ...config, ...updates }));
  }
  
  // ===== MÉTHODES - UTILITAIRES =====
  
  /**
   * Initialise avec un calque par défaut
   */
  initializeDefaultLayer(): LayerGroup {
    if (this.layerGroups().length === 0) {
      return this.createLayer({
        name: 'Default Layer',
        color: '#3b82f6',
        isVisible: true,
        isLocked: false
      });
    }
    return this.layerGroups()[0];
  }
  
  /**
   * Efface tous les calques
   */
  clear(): void {
    this.layerGroups.set([]);
    this.selectedLayerId.set(null);
  }
  
  /**
   * Duplique un calque
   */
  duplicateLayer(layerId: string): LayerGroup | null {
    const layer = this.getLayer(layerId);
    if (!layer) return null;
    
    const duplicate: LayerGroup = {
      ...structuredClone(layer),
      id: this.generateId(),
      name: `${layer.name} (copie)`,
      order: this.layerGroups().length,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.layerGroups.update(layers => [...layers, duplicate]);
    console.log('📋 Calque dupliqué:', duplicate.name);
    
    return duplicate;
  }
  
  /**
   * Fusionne plusieurs calques
   */
  mergeLayers(layerIds: string[], newName: string): LayerGroup | null {
    if (layerIds.length < 2) {
      console.warn('⚠️ Il faut au moins 2 calques pour fusionner');
      return null;
    }
    
    const layers = layerIds
      .map(id => this.getLayer(id))
      .filter(l => l !== undefined) as LayerGroup[];
    
    if (layers.length < 2) return null;
    
    // Créer le calque fusionné
    const mergedLayer = this.createLayer({
      name: newName || `${layers[0].name} + ${layers.length - 1} other(s)`,
      color: layers[0].color,
      isVisible: layers.every(l => l.isVisible),
      isLocked: layers.every(l => l.isLocked)
    });
    
    // Supprimer les calques d'origine
    layerIds.forEach(id => this.deleteLayer(id));
    
    console.log('🔀 Calques fusionnés:', mergedLayer.name);
    return mergedLayer;
  }
  
  // ===== MÉTHODES PRIVÉES =====
  
  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Génère une couleur aléatoire
   */
  private generateRandomColor(): string {
    const colors = [
      '#3b82f6', // Bleu
      '#10b981', // Vert
      '#f59e0b', // Orange
      '#8b5cf6', // Violet
      '#ec4899', // Rose
      '#06b6d4', // Cyan
      '#f97316', // Orange foncé
      '#14b8a6', // Teal
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}