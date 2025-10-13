import { Component, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentDefinition, ComponentType } from '../../models/component.model';
import { COMPONENT_CATALOG } from '../../config/component-definitions';

/**
 * Composant de la palette affichant tous les composants disponibles
 * Organisé par catégories avec recherche et filtres
 */
@Component({
  selector: 'app-component-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './component-palette.component.html',
  styleUrl: './component-palette.component.scss'
})
export class ComponentPaletteComponent {
  
  // ===========================
  // OUTPUTS - Événements
  // ===========================
  
  /** Émis quand un composant est sélectionné pour être ajouté */
  componentSelected = output<ComponentType>();
  
  /** Émis au début du drag d'un composant */
  componentDragStart = output<ComponentType>();
  
  // ===========================
  // DONNÉES
  // ===========================
  
  /** Catalogue complet des composants */
  private readonly catalog = COMPONENT_CATALOG;
  
  /** Liste des catégories */
  readonly categories = [
    { key: 'layout', label: 'Layout', icon: '🏗️' },
    { key: 'forms', label: 'Formulaires', icon: '📝' },
    { key: 'content', label: 'Contenu', icon: '📄' },
    { key: 'media', label: 'Médias', icon: '🖼️' },
    { key: 'custom', label: 'Personnalisés', icon: '🎨' }
  ];
  
  // ===========================
  // SIGNALS - État réactif
  // ===========================
  
  /** Terme de recherche */
  searchTerm = signal<string>('');
  
  /** Catégorie sélectionnée (null = toutes) */
  selectedCategory = signal<string | null>(null);
  
  /** État d'expansion des catégories */
  expandedCategories = signal<Set<string>>(new Set(['layout', 'forms', 'content', 'media', 'custom']));
  
  // ===========================
  // COMPUTED - Valeurs dérivées
  // ===========================
  
  /**
   * Composants filtrés selon la recherche et la catégorie
   */
  filteredComponents = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();
    
    let components: ComponentDefinition[] = [];
    
    // Filtrer par catégorie
    if (category) {
      components = this.catalog[category] || [];
    } else {
      // Toutes les catégories
      components = Object.values(this.catalog).flat();
    }
    
    // Filtrer par recherche
    if (search) {
      components = components.filter(comp =>
        comp.displayName.toLowerCase().includes(search) ||
        comp.description.toLowerCase().includes(search) ||
        comp.type.toLowerCase().includes(search)
      );
    }
    
    return components;
  });
  
  /**
   * Composants groupés par catégorie pour l'affichage
   */
  componentsByCategory = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const result: Record<string, ComponentDefinition[]> = {};
    
    this.categories.forEach(cat => {
      let components = this.catalog[cat.key] || [];
      
      // Filtrer par recherche si nécessaire
      if (search) {
        components = components.filter(comp =>
          comp.displayName.toLowerCase().includes(search) ||
          comp.description.toLowerCase().includes(search)
        );
      }
      
      if (components.length > 0) {
        result[cat.key] = components;
      }
    });
    
    return result;
  });
  
  /**
   * Nombre total de composants filtrés
   */
  totalFilteredCount = computed(() => this.filteredComponents().length);
  
  // ===========================
  // MÉTHODES - Recherche
  // ===========================
  
  /**
   * Met à jour le terme de recherche
   */
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    
    // Si recherche active, tout déplier
    if (value) {
      this.expandAllCategories();
    }
  }
  
  /**
   * Efface la recherche
   */
  clearSearch(): void {
    this.searchTerm.set('');
  }
  
  // ===========================
  // MÉTHODES - Catégories
  // ===========================
  
  /**
   * Sélectionne une catégorie (filtre)
   */
  selectCategory(categoryKey: string | null): void {
    this.selectedCategory.set(categoryKey);
  }
  
  /**
   * Toggle l'expansion d'une catégorie
   */
  toggleCategory(categoryKey: string): void {
    const expanded = this.expandedCategories();
    const newExpanded = new Set(expanded);
    
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    
    this.expandedCategories.set(newExpanded);
  }
  
  /**
   * Vérifie si une catégorie est étendue
   */
  isCategoryExpanded(categoryKey: string): boolean {
    return this.expandedCategories().has(categoryKey);
  }
  
  /**
   * Étend toutes les catégories
   */
  expandAllCategories(): void {
    const allKeys = this.categories.map(cat => cat.key);
    this.expandedCategories.set(new Set(allKeys));
  }
  
  /**
   * Replie toutes les catégories
   */
  collapseAllCategories(): void {
    this.expandedCategories.set(new Set());
  }
  
  /**
   * Récupère le label d'une catégorie
   */
  getCategoryLabel(categoryKey: string): string {
    return this.categories.find(cat => cat.key === categoryKey)?.label || categoryKey;
  }
  
  /**
   * Récupère l'icône d'une catégorie
   */
  getCategoryIcon(categoryKey: string): string {
    return this.categories.find(cat => cat.key === categoryKey)?.icon || '📦';
  }
  
  // ===========================
  // MÉTHODES - Actions
  // ===========================
  
  /**
   * Gère le clic sur un composant
   */
  onComponentClick(component: ComponentDefinition): void {
    this.componentSelected.emit(component.type);
  }
  
  /**
   * Gère le début du drag d'un composant
   */
  onDragStart(event: DragEvent, component: ComponentDefinition): void {
    if (!event.dataTransfer) return;
    
    // Stocker le type du composant
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('componentType', component.type);
    
    // Ajouter une classe visuelle
    const target = event.target as HTMLElement;
    target.classList.add('dragging');
    
    // Émettre l'événement
    this.componentDragStart.emit(component.type);
  }
  
  /**
   * Gère la fin du drag
   */
  onDragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement;
    target.classList.remove('dragging');
  }
  
  /**
   * Obtient le nombre de composants dans une catégorie
   */
  getCategoryCount(categoryKey: string): number {
    return this.catalog[categoryKey]?.length || 0;
  }
}