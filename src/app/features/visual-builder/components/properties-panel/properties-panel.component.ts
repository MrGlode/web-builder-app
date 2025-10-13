// src/app/features/visual-builder/components/properties-panel/properties-panel.component.ts

import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuilderComponent, ComponentProperties, ComponentStyles } from '../../models/component.model';

/**
 * Type pour une propriété éditable
 */
interface EditableProperty {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'textarea' | 'checkbox' | 'url';
  value: any;
  section: 'content' | 'styles' | 'attributes' | 'events';
  options?: string[];
  placeholder?: string;
}

/**
 * Sections de propriétés
 */
interface PropertySection {
  title: string;
  icon: string;
  key: 'content' | 'styles' | 'attributes' | 'events';
  properties: EditableProperty[];
}

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './properties-panel.component.html',
  styleUrls: ['./properties-panel.component.scss']
})
export class PropertiesPanelComponent {
  
  // ===== INPUTS =====
  
  /** Composant sélectionné à éditer */
  selectedComponent = input<BuilderComponent | null>(null);
  
  /** Indique si le panneau est visible */
  visible = input<boolean>(true);
  
  // ===== OUTPUTS =====
  
  /** Émis quand une propriété change */
  propertyChanged = output<{ 
    componentId: string; 
    section: 'content' | 'styles' | 'attributes' | 'events';
    property: string; 
    value: any 
  }>();
  
  /** Émis quand le panneau est fermé */
  closed = output<void>();
  
  // ===== COMPUTED =====
  
  /** Sections de propriétés groupées */
  propertySections = computed(() => {
    const component = this.selectedComponent();
    if (!component) return [];
    
    return this.buildPropertySections(component);
  });
  
  /** Indique si le panneau a du contenu */
  hasContent = computed(() => this.propertySections().length > 0);
  
  /** Titre du panneau basé sur le type de composant */
  panelTitle = computed(() => {
    const component = this.selectedComponent();
    return component ? `Propriétés : ${component.displayName}` : 'Propriétés';
  });
  
  // ===== PUBLIC METHODS =====
  
  /**
   * Gère le changement d'une propriété
   */
  onPropertyChange(
    section: 'content' | 'styles' | 'attributes' | 'events',
    propertyKey: string, 
    newValue: any
  ): void {
    const component = this.selectedComponent();
    if (!component) return;
    
    this.propertyChanged.emit({
      componentId: component.id,
      section: section,
      property: propertyKey,
      value: newValue
    });
    
    console.log(`📝 Property changed: ${section}.${propertyKey} = ${newValue}`);
  }
  
  /**
   * Ferme le panneau
   */
  onClose(): void {
    this.closed.emit();
  }
  
  // ===== PRIVATE METHODS =====
  
  /**
   * Construit les sections de propriétés pour un composant
   */
  private buildPropertySections(component: BuilderComponent): PropertySection[] {
    const sections: PropertySection[] = [];
    
    // Section Contenu
    const contentProps = this.getContentProperties(component);
    if (contentProps.length > 0) {
      sections.push({
        title: 'Contenu',
        icon: '📝',
        key: 'content',
        properties: contentProps
      });
    }
    
    // Section Styles
    const styleProps = this.getStyleProperties(component);
    if (styleProps.length > 0) {
      sections.push({
        title: 'Styles',
        icon: '🎨',
        key: 'styles',
        properties: styleProps
      });
    }
    
    // Section Attributs
    const attributeProps = this.getAttributeProperties(component);
    if (attributeProps.length > 0) {
      sections.push({
        title: 'Attributs HTML',
        icon: '🏷️',
        key: 'attributes',
        properties: attributeProps
      });
    }
    
    // Section Événements
    const eventProps = this.getEventProperties(component);
    if (eventProps.length > 0) {
      sections.push({
        title: 'Événements',
        icon: '⚡',
        key: 'events',
        properties: eventProps
      });
    }
    
    return sections;
  }
  
  /**
   * Propriétés de contenu
   */
  private getContentProperties(component: BuilderComponent): EditableProperty[] {
    const props: EditableProperty[] = [];
    const content = component.properties.content;
    
    if (!content) return props;
    
    // Texte
    if ('text' in content) {
      props.push({
        key: 'text',
        label: 'Texte',
        type: 'textarea',
        section: 'content',
        value: content.text || '',
        placeholder: 'Entrez le texte...'
      });
    }
    
    // HTML
    if ('html' in content) {
      props.push({
        key: 'html',
        label: 'HTML',
        type: 'textarea',
        section: 'content',
        value: content.html || '',
        placeholder: 'Entrez le code HTML...'
      });
    }
    
    // Source (images, vidéos)
    if ('src' in content) {
      props.push({
        key: 'src',
        label: 'Source (URL)',
        type: 'url',
        section: 'content',
        value: content.src || '',
        placeholder: 'https://...'
      });
    }
    
    // Alt (images)
    if ('alt' in content) {
      props.push({
        key: 'alt',
        label: 'Texte alternatif',
        type: 'text',
        section: 'content',
        value: content.alt || '',
        placeholder: 'Description de l\'image'
      });
    }
    
    // Href (liens)
    if ('href' in content) {
      props.push({
        key: 'href',
        label: 'Lien (URL)',
        type: 'url',
        section: 'content',
        value: content.href || '',
        placeholder: 'https://...'
      });
    }
    
    // Placeholder (inputs)
    if ('placeholder' in content) {
      props.push({
        key: 'placeholder',
        label: 'Placeholder',
        type: 'text',
        section: 'content',
        value: content.placeholder || '',
        placeholder: 'Texte d\'aide...'
      });
    }
    
    // Value (inputs)
    if ('value' in content) {
      props.push({
        key: 'value',
        label: 'Valeur',
        type: 'text',
        section: 'content',
        value: content.value || '',
        placeholder: 'Valeur par défaut'
      });
    }
    
    // Label (forms)
    if ('label' in content) {
      props.push({
        key: 'label',
        label: 'Label',
        type: 'text',
        section: 'content',
        value: content.label || '',
        placeholder: 'Libellé du champ'
      });
    }
    
    return props;
  }
  
  /**
   * Propriétés de styles
   */
  private getStyleProperties(component: BuilderComponent): EditableProperty[] {
    const props: EditableProperty[] = [];
    const styles = component.properties.styles;
    
    // Couleurs
    if ('color' in styles) {
      props.push({
        key: 'color',
        label: 'Couleur du texte',
        type: 'color',
        section: 'styles',
        value: styles.color || '#000000'
      });
    }
    
    if ('backgroundColor' in styles) {
      props.push({
        key: 'backgroundColor',
        label: 'Couleur de fond',
        type: 'color',
        section: 'styles',
        value: styles.backgroundColor || '#ffffff'
      });
    }
    
    // Typographie
    if ('fontSize' in styles) {
      props.push({
        key: 'fontSize',
        label: 'Taille de police',
        type: 'select',
        section: 'styles',
        value: styles.fontSize || '16px',
        options: ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px', '64px']
      });
    }
    
    if ('fontWeight' in styles) {
      props.push({
        key: 'fontWeight',
        label: 'Graisse de police',
        type: 'select',
        section: 'styles',
        value: styles.fontWeight || 'normal',
        options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']
      });
    }
    
    if ('fontFamily' in styles) {
      props.push({
        key: 'fontFamily',
        label: 'Police',
        type: 'select',
        section: 'styles',
        value: styles.fontFamily || 'inherit',
        options: ['inherit', 'Arial', 'Helvetica', 'Times New Roman', 'Courier', 'Verdana', 'Georgia', 'Comic Sans MS']
      });
    }
    
    if ('textAlign' in styles) {
      props.push({
        key: 'textAlign',
        label: 'Alignement du texte',
        type: 'select',
        section: 'styles',
        value: styles.textAlign || 'left',
        options: ['left', 'center', 'right', 'justify']
      });
    }
    
    // Dimensions
    if ('width' in styles) {
      props.push({
        key: 'width',
        label: 'Largeur',
        type: 'text',
        section: 'styles',
        value: styles.width || 'auto',
        placeholder: 'auto, 100%, 300px'
      });
    }
    
    if ('height' in styles) {
      props.push({
        key: 'height',
        label: 'Hauteur',
        type: 'text',
        section: 'styles',
        value: styles.height || 'auto',
        placeholder: 'auto, 100%, 200px'
      });
    }
    
    // Espacement
    if ('padding' in styles) {
      props.push({
        key: 'padding',
        label: 'Espacement intérieur',
        type: 'text',
        section: 'styles',
        value: styles.padding || '0',
        placeholder: '10px, 10px 20px'
      });
    }
    
    if ('margin' in styles) {
      props.push({
        key: 'margin',
        label: 'Espacement extérieur',
        type: 'text',
        section: 'styles',
        value: styles.margin || '0',
        placeholder: '10px, 10px 20px'
      });
    }
    
    // Bordures
    if ('border' in styles) {
      props.push({
        key: 'border',
        label: 'Bordure',
        type: 'text',
        section: 'styles',
        value: styles.border || 'none',
        placeholder: '1px solid #000'
      });
    }
    
    if ('borderRadius' in styles) {
      props.push({
        key: 'borderRadius',
        label: 'Arrondi des coins',
        type: 'text',
        section: 'styles',
        value: styles.borderRadius || '0',
        placeholder: '4px, 50%'
      });
    }
    
    // Layout
    if ('display' in styles) {
      props.push({
        key: 'display',
        label: 'Affichage',
        type: 'select',
        section: 'styles',
        value: styles.display || 'block',
        options: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none']
      });
    }
    
    // Flexbox
    if ('flexDirection' in styles) {
      props.push({
        key: 'flexDirection',
        label: 'Direction Flex',
        type: 'select',
        section: 'styles',
        value: styles.flexDirection || 'row',
        options: ['row', 'column', 'row-reverse', 'column-reverse']
      });
    }
    
    if ('justifyContent' in styles) {
      props.push({
        key: 'justifyContent',
        label: 'Justification',
        type: 'select',
        section: 'styles',
        value: styles.justifyContent || 'flex-start',
        options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']
      });
    }
    
    if ('alignItems' in styles) {
      props.push({
        key: 'alignItems',
        label: 'Alignement',
        type: 'select',
        section: 'styles',
        value: styles.alignItems || 'stretch',
        options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline']
      });
    }
    
    if ('gap' in styles) {
      props.push({
        key: 'gap',
        label: 'Espacement (gap)',
        type: 'text',
        section: 'styles',
        value: styles.gap || '0',
        placeholder: '10px, 1rem'
      });
    }
    
    return props;
  }
  
  /**
   * Propriétés d'attributs HTML
   */
  private getAttributeProperties(component: BuilderComponent): EditableProperty[] {
    const props: EditableProperty[] = [];
    const attributes = component.properties.attributes;
    
    // ID
    if ('id' in attributes) {
      props.push({
        key: 'id',
        label: 'ID',
        type: 'text',
        section: 'attributes',
        value: attributes.id || '',
        placeholder: 'identifiant-unique'
      });
    }
    
    // Class
    if ('class' in attributes) {
      props.push({
        key: 'class',
        label: 'Classes CSS',
        type: 'text',
        section: 'attributes',
        value: attributes.class || '',
        placeholder: 'class1 class2 class3'
      });
    }
    
    // Name
    if ('name' in attributes) {
      props.push({
        key: 'name',
        label: 'Name',
        type: 'text',
        section: 'attributes',
        value: attributes.name || '',
        placeholder: 'nom-du-champ'
      });
    }
    
    // Type
    if ('type' in attributes) {
      props.push({
        key: 'type',
        label: 'Type',
        type: 'select',
        section: 'attributes',
        value: attributes.type || 'text',
        options: ['text', 'email', 'password', 'number', 'tel', 'url', 'date', 'time', 'checkbox', 'radio', 'submit', 'button']
      });
    }
    
    // Required
    if ('required' in attributes) {
      props.push({
        key: 'required',
        label: 'Requis',
        type: 'checkbox',
        section: 'attributes',
        value: attributes.required || false
      });
    }
    
    // Disabled
    if ('disabled' in attributes) {
      props.push({
        key: 'disabled',
        label: 'Désactivé',
        type: 'checkbox',
        section: 'attributes',
        value: attributes.disabled || false
      });
    }
    
    // Readonly
    if ('readonly' in attributes) {
      props.push({
        key: 'readonly',
        label: 'Lecture seule',
        type: 'checkbox',
        section: 'attributes',
        value: attributes.readonly || false
      });
    }
    
    // Target
    if ('target' in attributes) {
      props.push({
        key: 'target',
        label: 'Target (liens)',
        type: 'select',
        section: 'attributes',
        value: attributes.target || '_self',
        options: ['_self', '_blank', '_parent', '_top']
      });
    }
    
    return props;
  }
  
  /**
   * Propriétés d'événements
   */
  private getEventProperties(component: BuilderComponent): EditableProperty[] {
    const props: EditableProperty[] = [];
    const events = component.properties.events;
    
    if (!events) return props;
    
    // onClick
    if ('onClick' in events) {
      props.push({
        key: 'onClick',
        label: 'Au clic',
        type: 'text',
        section: 'events',
        value: events.onClick || '',
        placeholder: 'handleClick()'
      });
    }
    
    // onChange
    if ('onChange' in events) {
      props.push({
        key: 'onChange',
        label: 'Au changement',
        type: 'text',
        section: 'events',
        value: events.onChange || '',
        placeholder: 'handleChange()'
      });
    }
    
    // onSubmit
    if ('onSubmit' in events) {
      props.push({
        key: 'onSubmit',
        label: 'À la soumission',
        type: 'text',
        section: 'events',
        value: events.onSubmit || '',
        placeholder: 'handleSubmit()'
      });
    }
    
    return props;
  }
}