// src/app/features/visual-builder/visual-builder.component.ts

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
import { ActionType } from './models/history.model';

@Component({
  selector: 'app-visual-builder',
  standalone: true,
  imports: [
    CommonModule,
    BuilderToolbarComponent,
    ComponentPaletteComponent,
    BuilderCanvasComponent,
    LayersPanelComponent,
    PropertiesPanelComponent
  ],
  templateUrl: './visual-builder.component.html',
  styleUrls: ['./visual-builder.component.scss']
})
export class VisualBuilderComponent {
  
  // ===== SERVICES =====
  
  private builderService = inject(VisualBuilderService);
  private historyService = inject(HistoryService);
  
  // ===== STATE =====
  
  /** Liste des composants (exposée depuis le service) */
  components = computed(() => {
    return this.builderService.getComponents();
  });
  
  /** Composant sélectionné (simple) */
  selectedComponent = signal<BuilderComponent | null>(null);
  
  /** 🆕 Composants sélectionnés (multiple) */
  selectedComponents = signal<BuilderComponent[]>([]);
  
  /** Panneau actif à droite */
  activeRightPanel = signal<'layers' | 'properties'>('properties');
  
  // ===== COMPUTED =====
  
  /** Nombre de composants */
  componentCount = computed(() => this.components().length);
  
  /** 🆕 Indique si plusieurs composants sont sélectionnés */
  hasMultipleSelection = computed(() => this.selectedComponents().length > 1);
  
  /** 🆕 IDs des composants sélectionnés (pour le template) */
  selectedComponentIds = computed(() => this.selectedComponents().map(c => c.id));
  
  // ===== LIFECYCLE =====
  
  ngOnInit(): void {
    console.log('🎨 Visual Builder initialized with Multi-Selection support');
  }
  
  // ===== CANVAS ACTIONS - SÉLECTION =====
  
  /**
   * 🔄 MODIFIÉ : Gère la sélection d'un composant (simple)
   * Maintenu pour compatibilité avec l'ancien système
   */
  onComponentSelected(component: BuilderComponent): void {
    console.log('📌 Component selected (single):', component.displayName);
    this.selectedComponent.set(component);
    this.selectedComponents.set([component]);
    
    // Afficher le panneau de propriétés
    this.activeRightPanel.set('properties');
  }
  
  /**
   * 🆕 NOUVEAU : Gère la sélection multiple de composants
   */
  onComponentsSelected(components: BuilderComponent[]): void {
    console.log('📌 Components selected (multiple):', components.length);
    this.selectedComponents.set(components);
    
    if (components.length === 1) {
      // Sélection simple
      this.selectedComponent.set(components[0]);
      this.activeRightPanel.set('properties');
    } else if (components.length > 1) {
      // Sélection multiple
      this.selectedComponent.set(null);
      // Afficher le panneau de propriétés communes
      this.activeRightPanel.set('properties');
    } else {
      // Aucune sélection
      this.selectedComponent.set(null);
    }
  }
  
  /**
   * 🆕 NOUVEAU : Gère la suppression de composants
   */
  onComponentsDeleted(ids: string[]): void {
    console.log('🗑️ Deleting components:', ids.length);
    
    if (ids.length === 0) return;
    
    // 1. Récupérer les composants AVANT suppression pour l'historique
    const componentsToDelete = ids
      .map(id => this.findComponentById(id))
      .filter(c => c !== null) as BuilderComponent[];
    
    // 2. Enregistrer dans l'historique (une action par composant)
    componentsToDelete.forEach(component => {
      const parentId = this.findParentId(component.id);
      const index = this.findComponentIndex(component.id, parentId);
      
      this.historyService.recordAction(
        ActionType.REMOVE_COMPONENT,
        `Suppression de ${component.displayName}`,
        { 
          component: component,
          parentId: parentId ?? undefined,
          index: index
        },
        undefined
      );
    });
    
    // 3. Filtrer les composants (récursif pour gérer les enfants)
    const currentComponents = this.components();
    const filteredComponents = this.filterComponentsById(currentComponents, ids);
    
    // 4. Mettre à jour la liste
    this.builderService.setComponents(filteredComponents);
    
    // 5. Réinitialiser la sélection
    this.selectedComponent.set(null);
    this.selectedComponents.set([]);
    
    console.log(`✅ ${ids.length} composant(s) supprimé(s)`);
  }
  
  // ===== CANVAS ACTIONS - DRAG & DROP =====
  
  /**
   * Gère le drop d'un composant sur le canvas
   */
  onComponentDropped(event: { 
    componentType: string; 
    parentId?: string; 
    index?: number 
  }): void {
    console.log('📥 Component dropped:', event);
    this.onComponentAdded({ type: event.componentType });
  }
  
  // ===== COMPONENT PALETTE ACTIONS =====
  
  /**
   * Gère l'ajout d'un composant depuis la palette
   */
  onComponentAdded(event: { type: string }): void {
    console.log('➕ Adding component:', event.type);
    
    // Créer un nouveau composant
    const newComponent = this.createComponentFromType(event.type);
    
    // Ajouter à la liste
    const currentComponents = this.components();
    this.builderService.setComponents([...currentComponents, newComponent]);
    
    // Enregistrer dans l'historique
    this.historyService.recordAction(
      ActionType.ADD_COMPONENT,
      `Ajout d'un composant ${newComponent.displayName}`,
      undefined,
      { component: newComponent }
    );
    
    console.log(`✅ Composant ${newComponent.displayName} ajouté`);
  }
  
  /**
   * Gère le clic sur un composant depuis la palette
   */
  onComponentClick(event: { type: string }): void {
    console.log('🖱️ Component clicked from palette:', event.type);
    this.onComponentAdded(event);
  }
  
  // ===== PROPERTIES PANEL ACTIONS =====
  
  /**
   * 🔄 MODIFIÉ : Gère le changement d'une propriété
   * Supporte maintenant l'édition groupée si plusieurs composants sélectionnés
   */
  onPropertyChanged(event: {
    componentId: string;
    section: 'content' | 'styles' | 'attributes' | 'events';
    property: string;
    value: any;
  }): void {
    console.log('📝 Property changed:', event);
    
    // Si plusieurs composants sélectionnés, appliquer à tous
    if (this.hasMultipleSelection()) {
      const selectedIds = this.selectedComponents().map(c => c.id);
      
      selectedIds.forEach(id => {
        const component = this.findComponentById(id);
        if (component) {
          // Cloner l'état avant
          const beforeComponent = structuredClone(component);
          
          // Appliquer la modification
          this.updateComponentProperty(component, event.section, event.property, event.value);
          
          // Enregistrer dans l'historique
          this.historyService.recordAction(
            ActionType.UPDATE_COMPONENT,
            `Modification de ${component.displayName}`,
            { component: beforeComponent },
            { component: structuredClone(component) }
          );
        }
      });
      
      console.log(`✅ Propriété mise à jour pour ${selectedIds.length} composants`);
    } else {
      // Édition simple
      const component = this.findComponentById(event.componentId);
      if (component) {
        // Cloner l'état avant
        const beforeComponent = structuredClone(component);
        
        // Appliquer la modification
        this.updateComponentProperty(component, event.section, event.property, event.value);
        
        // Enregistrer dans l'historique
        this.historyService.recordAction(
          ActionType.UPDATE_COMPONENT,
          `Modification de ${component.displayName}`,
          { component: beforeComponent },
          { component: structuredClone(component) }
        );
      }
    }
    
    // Mettre à jour la liste pour déclencher le refresh
    const updatedComponents = [...this.components()];
    this.builderService.setComponents(updatedComponents);
    
    // Mettre à jour le composant sélectionné
    if (this.selectedComponent()) {
      this.selectedComponent.set({...this.selectedComponent()!});
    }
  }
  
  /**
   * Gère la fermeture du panneau de propriétés
   */
  onPropertiesPanelClosed(): void {
    this.selectedComponent.set(null);
    this.selectedComponents.set([]);
  }
  
  // ===== MÉTHODES UTILITAIRES =====
  
  /**
   * 🆕 NOUVEAU : Filtre les composants par IDs (récursif)
   */
  private filterComponentsById(
    components: BuilderComponent[], 
    idsToRemove: string[]
  ): BuilderComponent[] {
    const idsSet = new Set(idsToRemove);
    
    return components
      .filter(c => !idsSet.has(c.id))
      .map(c => ({
        ...c,
        children: c.children 
          ? this.filterComponentsById(c.children, idsToRemove) 
          : undefined
      }));
  }
  
  /**
   * Met à jour une propriété d'un composant
   */
  private updateComponentProperty(
    component: BuilderComponent,
    section: 'content' | 'styles' | 'attributes' | 'events',
    property: string,
    value: any
  ): void {
    switch (section) {
      case 'content':
        if (component.properties.content) {
          (component.properties.content as any)[property] = value;
        }
        break;
        
      case 'styles':
        (component.properties.styles as any)[property] = value;
        break;
        
      case 'attributes':
        (component.properties.attributes as any)[property] = value;
        break;
        
      case 'events':
        if (!component.properties.events) {
          component.properties.events = {};
        }
        (component.properties.events as any)[property] = value;
        break;
    }
  }
  
  /**
   * Trouve un composant par son ID (récursif)
   */
  private findComponentById(id: string): BuilderComponent | null {
    const find = (components: BuilderComponent[]): BuilderComponent | null => {
      for (const comp of components) {
        if (comp.id === id) return comp;
        if (comp.children) {
          const found = find(comp.children);
          if (found) return found;
        }
      }
      return null;
    };
    return find(this.components());
  }
  
  /**
   * Trouve l'ID du parent d'un composant
   */
  private findParentId(childId: string): string | null {
    const find = (components: BuilderComponent[]): string | null => {
      for (const comp of components) {
        if (comp.children?.some(c => c.id === childId)) {
          return comp.id;
        }
        if (comp.children) {
          const found = find(comp.children);
          if (found) return found;
        }
      }
      return null;
    };
    return find(this.components());
  }
  
  /**
   * Trouve l'index d'un composant dans son parent
   */
  private findComponentIndex(componentId: string, parentId: string | null): number {
    if (parentId) {
      const parent = this.findComponentById(parentId);
      return parent?.children?.findIndex(c => c.id === componentId) ?? -1;
    }
    return this.components().findIndex(c => c.id === componentId);
  }
  
  /**
   * Crée un composant à partir de son type
   */
  private createComponentFromType(type: string): BuilderComponent {
    const id = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: id,
      type: type as any,
      category: 'layout',
      displayName: type.charAt(0).toUpperCase() + type.slice(1),
      properties: {
        content: {
          text: `Nouveau ${type}`
        },
        styles: {
          padding: '16px',
          margin: '8px',
          backgroundColor: '#ffffff',
          borderRadius: '8px'
        },
        attributes: {}
      },
      order: this.components().length
    };
  }
  
  /**
   * Change le panneau actif à droite
   */
  switchRightPanel(panel: 'layers' | 'properties'): void {
    this.activeRightPanel.set(panel);
  }
  
  // ===== SUGGESTIONS D'AMÉLIORATION =====
  
  /**
   * 🆕 SUGGESTION : Dupliquer les composants sélectionnés
   */
  onComponentsDuplicated(ids: string[]): void {
    console.log('📋 Duplicating components:', ids.length);
    
    if (ids.length === 0) return;
    
    const toDuplicate = ids
      .map(id => this.findComponentById(id))
      .filter(c => c !== null) as BuilderComponent[];
    
    const duplicates = toDuplicate.map(comp => {
      const duplicate: BuilderComponent = {
        ...structuredClone(comp),
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        displayName: `${comp.displayName} (copie)`,
        order: this.components().length
      };
      
      // Enregistrer dans l'historique
      this.historyService.recordAction(
        ActionType.DUPLICATE_COMPONENT,
        `Duplication de ${comp.displayName}`,
        undefined,
        { component: duplicate }
      );
      
      return duplicate;
    });
    
    const currentComponents = this.components();
    this.builderService.setComponents([...currentComponents, ...duplicates]);
    
    console.log(`✅ ${duplicates.length} composant(s) dupliqué(s)`);
  }
  
  /**
   * 🆕 SUGGESTION : Grouper les composants sélectionnés
   */
  onComponentsGrouped(ids: string[]): void {
    console.log('📦 Grouping components:', ids.length);
    
    if (ids.length < 2) {
      console.log('⚠️ Il faut au moins 2 composants pour grouper');
      return;
    }
    
    // TODO: Créer un container et y déplacer les composants
    // TODO: Implémenter la logique de regroupement
    
    console.log('⚠️ Grouping not yet implemented');
  }
  
  /**
   * 🆕 SUGGESTION : Aligner les composants sélectionnés
   */
  onComponentsAligned(
    ids: string[], 
    direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ): void {
    console.log('📏 Aligning components:', direction);
    
    if (ids.length < 2) {
      console.log('⚠️ Il faut au moins 2 composants pour aligner');
      return;
    }
    
    // TODO: Calculer les nouvelles positions
    // TODO: Mettre à jour les styles de position
    
    console.log('⚠️ Alignment not yet implemented');
  }
  
  /**
   * 🆕 SUGGESTION : Toggle le verrouillage des composants
   */
  onComponentsLockToggled(event: { ids: string[], locked: boolean }): void {
    console.log(`🔒 ${event.locked ? 'Locking' : 'Unlocking'} components:`, event.ids.length);
    
    event.ids.forEach(id => {
      const component = this.findComponentById(id);
      if (component) {
        // Cloner avant modification
        const beforeComponent = structuredClone(component);
        
        // Modifier
        component.isLocked = event.locked;
        
        // Enregistrer dans l'historique
        this.historyService.recordAction(
          ActionType.UPDATE_COMPONENT,
          `${event.locked ? 'Verrouillage' : 'Déverrouillage'} de ${component.displayName}`,
          { component: beforeComponent },
          { component: structuredClone(component) }
        );
      }
    });
    
    const updatedComponents = [...this.components()];
    this.builderService.setComponents(updatedComponents);
    
    console.log(`✅ ${event.ids.length} composant(s) ${event.locked ? 'verrouillé(s)' : 'déverrouillé(s)'}`);
  }
  
  /**
   * 🔄 OPTIONNEL : Gère les raccourcis clavier au niveau global
   */
  onKeyDown(event: KeyboardEvent): void {
    // Laisser le BuilderCanvas gérer la plupart des raccourcis
    // Ici, vous pouvez ajouter des raccourcis spécifiques au builder
    
    // Exemple : Ctrl+S pour sauvegarder
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.saveProject();
      return;
    }
    
    // Exemple : Ctrl+Z pour undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.builderService.undo();
      return;
    }
    
    // Exemple : Ctrl+Shift+Z ou Ctrl+Y pour redo
    if (((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')) {
      event.preventDefault();
      this.builderService.redo();
      return;
    }
  }
  
  /**
   * Sauvegarde le projet
   */
  private saveProject(): void {
    console.log('💾 Saving project...');
    // TODO: Implémenter la sauvegarde
    const projectData = {
      components: this.components(),
      timestamp: Date.now()
    };
    console.log('Project data:', projectData);
  }
}