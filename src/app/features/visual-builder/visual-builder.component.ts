import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { VisualBuilderService } from './services/visual-builder.service';
import { HistoryService } from './services/history.service';

// Composants
import { BuilderToolbarComponent } from './components/builder-toolbar/builder-toolbar.component';
import { ComponentPaletteComponent } from './components/component-palette/component-palette.component';
import { BuilderCanvasComponent } from './components/builder-canvas/builder-canvas.component';
import { LayersPanelComponent } from './components/layers-panel/layer-panel.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';

// Models
import { BuilderComponent } from './models/component.model';
import { ViewMode } from './models/page.model';

@Component({
  selector: 'app-visual-builder',
  standalone: true,
  imports: [
    CommonModule,
    BuilderToolbarComponent,
    ComponentPaletteComponent,
    BuilderCanvasComponent,
    LayersPanelComponent,
    PropertiesPanelComponent  // ← AJOUT IMPORTANT
  ],
  templateUrl: './visual-builder.component.html',
  styleUrls: ['./visual-builder.component.scss']
})
export class VisualBuilderComponent {
  
  // ===== SERVICES =====
  
  private builderService = inject(VisualBuilderService);
  private historyService = inject(HistoryService);
  
  // ===== STATE =====
  
  /** Liste des composants */
  components = this.builderService.components;
  
  /** Composant sélectionné */
  selectedComponent = this.builderService.selectedComponent;
  
  /** Mode de vue actuel */
  viewMode = signal<ViewMode>('desktop');
  
  /** Niveau de zoom */
  zoomLevel = signal<number>(100);
  
  /** Panneau actif (layers ou properties) */
  activeRightPanel = signal<'layers' | 'properties'>('properties');
  
  // ===== COMPUTED =====
  
  /** Indique si on peut undo */
  canUndo = this.historyService.canUndo;
  
  /** Indique si on peut redo */
  canRedo = this.historyService.canRedo;
  
  /** Nombre de composants */
  componentCount = computed(() => this.components().length);
  
  // ===== LIFECYCLE =====
  
  ngOnInit(): void {
    console.log('🎨 Visual Builder initialized');
    
    // Charger un projet ou créer une page vide
    this.initializeEmptyPage();
  }
  
  // ===== TOOLBAR ACTIONS =====
  
  /**
   * Change le mode de vue (desktop, tablet, mobile)
   */
  onViewModeChange(mode: ViewMode): void {
    this.viewMode.set(mode);
    console.log('📱 View mode changed to:', mode);
  }
  
  /**
   * Change le niveau de zoom
   */
  onZoomChange(level: number): void {
    this.zoomLevel.set(level);
    console.log('🔍 Zoom level:', level);
  }
  
  /**
   * Annule la dernière action
   */
  onUndo(): void {
    this.historyService.undo();
    console.log('↩️ Undo');
  }
  
  /**
   * Refait la dernière action annulée
   */
  onRedo(): void {
    this.historyService.redo();
    console.log('↪️ Redo');
  }
  
  /**
   * Sauvegarde le projet
   */
  onSave(): void {
    console.log('💾 Saving project...');
    // TODO: Implémenter la sauvegarde
  }
  
  /**
   * Prévisualise la page
   */
  onPreview(): void {
    console.log('👁️ Preview');
    // TODO: Implémenter la prévisualisation
  }
  
  /**
   * Exporte le projet
   */
  onExport(): void {
    console.log('📤 Export');
    // TODO: Implémenter l'export
  }
  
  // ===== COMPONENT PALETTE ACTIONS =====
  
  /**
   * Gère l'ajout d'un composant depuis la palette
   */
  onComponentAdded(event: { type: string }): void {
    console.log('➕ Adding component:', event.type);
    this.builderService.addComponentFromPalette(event.type);
  }
  
  /**
   * Gère le drag d'un composant depuis la palette
   */
  onComponentDragged(event: { type: string }): void {
    console.log('🎯 Component dragged:', event.type);
    // Le drop sera géré par le canvas
  }
  
  // ===== CANVAS ACTIONS =====
  
  /**
   * Gère la sélection d'un composant
   */
  onComponentSelected(component: BuilderComponent): void {
    console.log('📌 Component selected:', component.displayName);
    this.builderService.selectComponent(component.id);
    
    // Afficher le panneau de propriétés
    this.activeRightPanel.set('properties');
  }
  
  /**
   * Gère le survol d'un composant
   */
  onComponentHovered(componentId: string | null): void {
    // TODO: Gérer le hover
  }
  
  /**
   * Gère le drop d'un composant sur le canvas
   */
  onComponentDropped(event: { 
    componentType: string; 
    parentId?: string; 
    index?: number 
  }): void {
    console.log('📥 Component dropped:', event);
    this.builderService.addComponentFromPalette(
      event.componentType,
      event.parentId,
      event.index
    );
  }
  
  // ===== LAYERS PANEL ACTIONS =====
  
  /**
   * Gère la sélection depuis le layers panel
   */
  onLayerSelected(componentId: string): void {
    this.builderService.selectComponent(componentId);
  }
  
  /**
   * Gère la réorganisation des composants
   */
  onLayersReordered(event: { componentId: string; newIndex: number }): void {
    console.log('🔄 Layers reordered:', event);
    // TODO: Implémenter la réorganisation
  }
  
  /**
   * Gère la suppression d'un composant
   */
  onComponentDeleted(componentId: string): void {
    console.log('🗑️ Component deleted:', componentId);
    this.builderService.removeComponent(componentId);
  }
  
  /**
   * Toggle la visibilité d'un composant
   */
  onVisibilityToggled(componentId: string): void {
    console.log('👁️ Visibility toggled:', componentId);
    // TODO: Implémenter le toggle de visibilité
  }
  
  /**
   * Toggle le verrouillage d'un composant
   */
  onLockToggled(componentId: string): void {
    console.log('🔒 Lock toggled:', componentId);
    // TODO: Implémenter le toggle de verrouillage
  }
  
  // ===== PROPERTIES PANEL ACTIONS =====
  
  /**
   * Gère le changement d'une propriété
   */
  onPropertyChanged(event: {
    componentId: string;
    section: 'content' | 'styles' | 'attributes' | 'events';
    property: string;
    value: any;
  }): void {
    console.log('📝 Property changed:', event);
    
    const component = this.findComponentById(event.componentId);
    if (!component) return;
    
    // Mise à jour de la propriété selon la section
    switch (event.section) {
      case 'content':
        if (component.properties.content) {
          (component.properties.content as any)[event.property] = event.value;
        }
        break;
        
      case 'styles':
        (component.properties.styles as any)[event.property] = event.value;
        break;
        
      case 'attributes':
        (component.properties.attributes as any)[event.property] = event.value;
        break;
        
      case 'events':
        if (component.properties.events) {
          (component.properties.events as any)[event.property] = event.value;
        }
        break;
    }
    
    // Sauvegarder dans l'historique
    this.historyService.saveState({
      type: 'update',
      description: `Updated ${event.section}.${event.property}`,
      data: { componentId: event.componentId, event }
    });
    
    // Mettre à jour l'affichage
    this.builderService.components.set([...this.components()]);
  }
  
  /**
   * Ferme le panneau de propriétés
   */
  onPropertiesPanelClosed(): void {
    console.log('❌ Properties panel closed');
    // Optionnel: désélectionner le composant
    // this.builderService.selectComponent(null);
  }
  
  // ===== RIGHT PANEL ACTIONS =====
  
  /**
   * Change le panneau actif à droite
   */
  switchRightPanel(panel: 'layers' | 'properties'): void {
    this.activeRightPanel.set(panel);
  }
  
  // ===== KEYBOARD SHORTCUTS =====
  
  /**
   * Gère les raccourcis clavier
   */
  onKeyDown(event: KeyboardEvent): void {
    // Ctrl/Cmd + Z : Undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.onUndo();
    }
    
    // Ctrl/Cmd + Shift + Z : Redo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
      event.preventDefault();
      this.onRedo();
    }
    
    // Ctrl/Cmd + S : Save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.onSave();
    }
    
    // Delete : Supprimer le composant sélectionné
    if (event.key === 'Delete' && this.selectedComponent()) {
      event.preventDefault();
      this.onComponentDeleted(this.selectedComponent()!.id);
    }
  }
  
  // ===== PRIVATE METHODS =====
  
  /**
   * Initialise une page vide
   */
  private initializeEmptyPage(): void {
    // Créer un container de base si vide
    if (this.components().length === 0) {
      console.log('📄 Initializing empty page');
      // Optionnel: ajouter un container par défaut
    }
  }
  
  /**
   * Trouve un composant par son ID
   */
  private findComponentById(id: string): BuilderComponent | null {
    return this.builderService.findComponentById(id);
  }
}