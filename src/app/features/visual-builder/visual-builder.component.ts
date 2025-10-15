// src/app/features/visual-builder/components/visual-builder/visual-builder.component.ts

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

@Component({
  selector: 'app-visual-builder',
  standalone: true,
  imports: [
    CommonModule,
    BuilderToolbarComponent,
    ComponentPaletteComponent,
    BuilderCanvasComponent,
    LayersPanelComponent,
    PropertiesPanelComponent  // ← Ajout du Properties Panel
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
    // Accès public aux composants
    return this.builderService.getComponents();
  });
  
  /** Composant sélectionné */
  selectedComponent = signal<BuilderComponent | null>(null);
  
  /** Panneau actif à droite */
  activeRightPanel = signal<'layers' | 'properties'>('properties');
  
  // ===== COMPUTED =====
  
  /** Nombre de composants */
  componentCount = computed(() => this.components().length);
  
  // ===== LIFECYCLE =====
  
  ngOnInit(): void {
    console.log('🎨 Visual Builder initialized');
  }
  
  // ===== COMPONENT PALETTE ACTIONS =====
  
  /**
   * Gère l'ajout d'un composant depuis la palette
   */
  onComponentAdded(event: { type: string }): void {
    console.log('➕ Adding component:', event.type);
    
    // Créer un nouveau composant
    const newComponent = this.createComponentFromType(event.type);
    
    // L'ajouter à la liste
    const currentComponents = this.components();
    this.builderService.setComponents([...currentComponents, newComponent]);
  }
  
  /**
   * Gère le clic sur un composant depuis la palette
   */
  onComponentClick(event: { type: string }): void {
    console.log('🖱️ Component clicked from palette:', event.type);
    this.onComponentAdded(event);
  }
  
  // ===== CANVAS ACTIONS =====
  
  /**
   * Gère la sélection d'un composant
   */
  onComponentSelected(component: BuilderComponent): void {
    console.log('📌 Component selected:', component.displayName);
    this.selectedComponent.set(component);
    
    // Afficher le panneau de propriétés
    this.activeRightPanel.set('properties');
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
    this.onComponentAdded({ type: event.componentType });
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
    
    // Trouver le composant
    const component = this.findComponentById(event.componentId);
    if (!component) {
      console.warn('Component not found:', event.componentId);
      return;
    }
    
    // Mettre à jour la propriété selon la section
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
        if (!component.properties.events) {
          component.properties.events = {};
        }
        (component.properties.events as any)[event.property] = event.value;
        break;
    }
    
    // Mettre à jour la liste des composants pour déclencher le refresh
    const updatedComponents = [...this.components()];
    this.builderService.setComponents(updatedComponents);
    
    // Mettre à jour le composant sélectionné pour rafraîchir le panel
    this.selectedComponent.set({ ...component });
    
    console.log('✅ Component updated:', component);
  }
  
  /**
   * Ferme le panneau de propriétés
   */
  onPropertiesPanelClosed(): void {
    console.log('❌ Properties panel closed');
    // Optionnel: désélectionner le composant
    // this.selectedComponent.set(null);
  }
  
  // ===== LAYERS PANEL ACTIONS =====
  
  /**
   * Gère la sélection depuis le layers panel
   */
  onLayerSelected(componentId: string): void {
    const component = this.findComponentById(componentId);
    if (component) {
      this.onComponentSelected(component);
    }
  }
  
  /**
   * Gère la suppression d'un composant
   */
  onComponentDeleted(componentId: string): void {
    console.log('🗑️ Component deleted:', componentId);
    
    const updatedComponents = this.components().filter(c => c.id !== componentId);
    this.builderService.setComponents(updatedComponents);
    
    // Désélectionner si c'était le composant sélectionné
    if (this.selectedComponent()?.id === componentId) {
      this.selectedComponent.set(null);
    }
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
    // Delete : Supprimer le composant sélectionné
    if (event.key === 'Delete' && this.selectedComponent()) {
      event.preventDefault();
      this.onComponentDeleted(this.selectedComponent()!.id);
    }
    
    // Escape : Désélectionner
    if (event.key === 'Escape') {
      this.selectedComponent.set(null);
    }
  }
  
  // ===== PRIVATE METHODS =====
  
  /**
   * Trouve un composant par son ID
   */
  private findComponentById(id: string): BuilderComponent | null {
    const components = this.components();
    
    // Fonction récursive pour chercher dans les enfants
    const search = (comps: BuilderComponent[]): BuilderComponent | null => {
      for (const comp of comps) {
        if (comp.id === id) {
          return comp;
        }
        
        if (comp.children && comp.children.length > 0) {
          const found = search(comp.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return search(components);
  }
  
  /**
   * Crée un nouveau composant à partir d'un type
   */
  private createComponentFromType(type: string): BuilderComponent {
    // Générer un ID unique
    const id = this.generateId(type);
    
    // Créer un composant de base selon le type
    const component: BuilderComponent = {
      id: id,
      type: type as any,
      category: this.getCategoryForType(type),
      displayName: this.getDisplayNameForType(type),
      order: this.components().length,
      properties: {
        content: this.getDefaultContent(type),
        styles: this.getDefaultStyles(type),
        attributes: {}
      }
    };
    
    return component;
  }
  
  /**
   * Génère un ID unique
   */
  private generateId(type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${type}_${timestamp}_${random}`;
  }
  
  /**
   * Obtient la catégorie pour un type
   */
  private getCategoryForType(type: string): 'layout' | 'forms' | 'content' | 'media' | 'custom' {
    const layoutTypes = ['container', 'section', 'grid', 'flexbox', 'divider'];
    const formTypes = ['input', 'textarea', 'select', 'checkbox', 'radio', 'button'];
    const contentTypes = ['heading', 'paragraph', 'list', 'table', 'code'];
    const mediaTypes = ['image', 'video', 'icon', 'gallery'];
    
    if (layoutTypes.includes(type)) return 'layout';
    if (formTypes.includes(type)) return 'forms';
    if (contentTypes.includes(type)) return 'content';
    if (mediaTypes.includes(type)) return 'media';
    return 'custom';
  }
  
  /**
   * Obtient le nom d'affichage pour un type
   */
  private getDisplayNameForType(type: string): string {
    const names: Record<string, string> = {
      container: 'Container',
      section: 'Section',
      heading: 'Heading',
      paragraph: 'Paragraph',
      button: 'Button',
      input: 'Input',
      image: 'Image',
      // ... autres types
    };
    
    return names[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }
  
  /**
   * Obtient le contenu par défaut pour un type
   */
  private getDefaultContent(type: string): any {
    const defaults: Record<string, any> = {
      heading: { text: 'Heading' },
      paragraph: { text: 'This is a paragraph.' },
      button: { text: 'Button', label: 'Click me' },
      input: { placeholder: 'Enter text...', value: '' },
      image: { src: 'https://via.placeholder.com/300', alt: 'Placeholder' },
    };
    
    return defaults[type] || {};
  }
  
  /**
   * Obtient les styles par défaut pour un type
   */
  private getDefaultStyles(type: string): any {
    const baseStyles = {
      padding: '10px',
      margin: '0',
    };
    
    const typeSpecificStyles: Record<string, any> = {
      container: {
        ...baseStyles,
        display: 'block',
        width: '100%',
        backgroundColor: '#f5f5f5',
        border: '1px solid #e0e0e0',
      },
      heading: {
        ...baseStyles,
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333333',
      },
      paragraph: {
        ...baseStyles,
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#666666',
      },
      button: {
        ...baseStyles,
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      },
    };
    
    return typeSpecificStyles[type] || baseStyles;
  }
}