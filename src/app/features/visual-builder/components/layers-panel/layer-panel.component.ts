// src/app/features/visual-builder/components/layers-panel/layers-panel.component.ts

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuilderComponent } from '../../models/component.model';
import { VisualBuilderService } from '../../services/visual-builder.service';
import { LayersService } from '../../services/layer.service';

@Component({
  selector: 'app-layers-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './layer-panel.component.html',
  styleUrls: ['./layer-panel.component.scss']
})
export class LayersPanelComponent {
  private builderService = inject(VisualBuilderService);
  private layersService = inject(LayersService);

  // Expose les données
  components = this.builderService.allComponents;
  selectedComponent = this.builderService.selectedComponent;
  viewOptions = this.layersService.currentViewOptions;

  // État de recherche
  searchQuery = '';

  // Composants filtrés
  filteredComponents = computed(() => {
    const query = this.searchQuery.toLowerCase();
    if (!query) return this.components();

    return this.filterComponentsBySearch(this.components(), query);
  });

  /**
   * Filtre les composants par recherche
   */
  private filterComponentsBySearch(
    components: BuilderComponent[], 
    query: string
  ): BuilderComponent[] {
    return components.filter(comp => {
      const matchesName = comp.displayName.toLowerCase().includes(query);
      const matchesType = comp.type.toLowerCase().includes(query);
      const hasMatchingChild = comp.children?.some(child => 
        this.filterComponentsBySearch([child], query).length > 0
      );
      
      return matchesName || matchesType || hasMatchingChild;
    });
  }

  /**
   * Obtient l'état d'un layer
   */
  getLayerState(componentId: string) {
    return this.layersService.getLayerState(componentId);
  }

  /**
   * Vérifie si un composant est sélectionné
   */
  isSelected(component: BuilderComponent): boolean {
    return this.selectedComponent()?.id === component.id;
  }

  /**
   * Sélectionne un composant
   */
  selectComponent(component: BuilderComponent, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    const state = this.getLayerState(component.id);
    if (state.isLocked) return;

    this.builderService.selectComponent(component.id);
    
    // Auto-expand si configuré
    if (this.viewOptions().autoExpand && component.children?.length) {
      this.layersService.updateLayerState(component.id, { isExpanded: true });
    }
  }

  /**
   * Toggle l'expansion d'un composant
   */
  toggleExpand(component: BuilderComponent, event: Event) {
    event.stopPropagation();
    this.layersService.toggleExpanded(component.id);
  }

  /**
   * Toggle la visibilité d'un composant
   */
  toggleVisibility(component: BuilderComponent, event: Event) {
    event.stopPropagation();
    this.layersService.toggleVisibility(component.id);
    
    // Mettre à jour dans le builder
    this.builderService.updateComponent(component.id, {
      isHidden: !this.getLayerState(component.id).isVisible
    });
  }

  /**
   * Toggle le verrouillage d'un composant
   */
  toggleLock(component: BuilderComponent, event: Event) {
    event.stopPropagation();
    this.layersService.toggleLock(component.id);
    
    // Mettre à jour dans le builder
    this.builderService.updateComponent(component.id, {
      isLocked: !this.getLayerState(component.id).isLocked
    });
  }

  /**
   * Supprime un composant
   */
  deleteComponent(component: BuilderComponent, event: Event) {
    event.stopPropagation();
    
    if (confirm(`Supprimer "${component.displayName}" ?`)) {
      this.builderService.removeComponent(component.id);
    }
  }

  /**
   * Duplique un composant
   */
  duplicateComponent(component: BuilderComponent, event: Event) {
    event.stopPropagation();
    
    const duplicate: BuilderComponent = {
      ...structuredClone(component),
      id: this.generateId(),
      displayName: `${component.displayName} (copie)`
    };
    
    this.builderService.addComponent(duplicate, component.parentId);
  }

  /**
   * Obtient l'icône d'un composant selon son type
   */
  getComponentIcon(component: BuilderComponent): string {
    const icons: Record<string, string> = {
      'container': '📦',
      'section': '📄',
      'heading': '🔤',
      'paragraph': '📝',
      'button': '🔘',
      'input': '✏️',
      'image': '🖼️',
      'grid': '⊞',
      'flex': '⬌',
      'form': '📋',
      'list': '📑',
      'link': '🔗',
      'video': '🎬',
      'icon': '⭐',
      'divider': '➖'
    };
    
    return icons[component.type] || '🧩';
  }

  /**
   * Recherche de composants
   */
  onSearch(query: string) {
    this.searchQuery = query;
  }

  /**
   * Efface la recherche
   */
  clearSearch() {
    this.searchQuery = '';
  }

  /**
   * Collapse tous les layers
   */
  collapseAll() {
    this.layersService.collapseAll();
  }

  /**
   * Expand tous les layers
   */
  expandAll() {
    this.layersService.expandAll();
  }

  /**
   * Actions sur les options de vue
   */
  toggleShowHidden() {
    const current = this.viewOptions();
    this.layersService.updateViewOptions({
      showHidden: !current.showHidden
    });
  }

  toggleShowLocked() {
    const current = this.viewOptions();
    this.layersService.updateViewOptions({
      showLocked: !current.showLocked
    });
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}