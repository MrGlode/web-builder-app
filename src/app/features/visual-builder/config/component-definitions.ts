import { ComponentDefinition } from '../models/component.model';

export const CONTAINER_DEFINITION: ComponentDefinition = {
  type: 'container',
  category: 'layout',
  displayName: 'Container',
  icon: '📦',
  description: 'Conteneur flexible pour organiser d\'autres composants',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      display: 'block',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'transparent'
    },
    attributes: {
      class: 'container'
    }
  }
};

export const SECTION_DEFINITION: ComponentDefinition = {
  type: 'section',
  category: 'layout',
  displayName: 'Section',
  icon: '📄',
  description: 'Section sémantique pour structurer le contenu',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      display: 'block',
      width: '100%',
      padding: '40px 20px',
      backgroundColor: '#ffffff'
    },
    attributes: {
      class: 'section'
    }
  }
};

export const GRID_DEFINITION: ComponentDefinition = {
  type: 'grid',
  category: 'layout',
  displayName: 'Grid',
  icon: '⊞',
  description: 'Grille CSS pour disposer les éléments en colonnes',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      width: '100%',
      padding: '20px'
    },
    attributes: {
      class: 'grid'
    }
  }
};

export const FLEXBOX_DEFINITION: ComponentDefinition = {
  type: 'flexbox',
  category: 'layout',
  displayName: 'Flexbox',
  icon: '⊟',
  description: 'Conteneur Flexbox pour aligner les éléments',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      gap: '10px',
      width: '100%',
      padding: '20px'
    },
    attributes: {
      class: 'flexbox'
    }
  }
};

export const DIVIDER_DEFINITION: ComponentDefinition = {
  type: 'divider',
  category: 'layout',
  displayName: 'Divider',
  icon: '─',
  description: 'Séparateur horizontal pour diviser le contenu',
  canHaveChildren: false,
  defaultProperties: {
    content: {},
    styles: {
      width: '100%',
      height: '1px',
      backgroundColor: '#e0e0e0',
      margin: '20px 0',
      border: 'none'
    },
    attributes: {
      class: 'divider'
    }
  }
};

// ============================================
// FORM COMPONENTS
// ============================================

export const INPUT_DEFINITION: ComponentDefinition = {
  type: 'input',
  category: 'forms',
  displayName: 'Input',
  icon: '⌨',
  description: 'Champ de saisie texte',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      placeholder: 'Entrez du texte...',
      value: ''
    },
    styles: {
      width: '100%',
      padding: '10px 15px',
      fontSize: '14px',
      border: '1px solid #d0d0d0',
      borderRadius: '4px',
      backgroundColor: '#ffffff'
    },
    attributes: {
      type: 'text',
      name: 'input',
      class: 'input'
    }
  }
};

export const TEXTAREA_DEFINITION: ComponentDefinition = {
  type: 'textarea',
  category: 'forms',
  displayName: 'Textarea',
  icon: '📝',
  description: 'Zone de texte multiligne',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      placeholder: 'Entrez du texte...',
      value: ''
    },
    styles: {
      width: '100%',
      minHeight: '120px',
      padding: '10px 15px',
      fontSize: '14px',
      border: '1px solid #d0d0d0',
      borderRadius: '4px',
      backgroundColor: '#ffffff',
      resize: 'vertical'
    },
    attributes: {
      name: 'textarea',
      rows: '5',
      class: 'textarea'
    }
  }
};

export const SELECT_DEFINITION: ComponentDefinition = {
  type: 'select',
  category: 'forms',
  displayName: 'Select',
  icon: '▼',
  description: 'Liste déroulante de sélection',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      value: ''
    },
    styles: {
      width: '100%',
      padding: '10px 15px',
      fontSize: '14px',
      border: '1px solid #d0d0d0',
      borderRadius: '4px',
      backgroundColor: '#ffffff',
      cursor: 'pointer'
    },
    attributes: {
      name: 'select',
      class: 'select'
    }
  }
};

export const CHECKBOX_DEFINITION: ComponentDefinition = {
  type: 'checkbox',
  category: 'forms',
  displayName: 'Checkbox',
  icon: '☑',
  description: 'Case à cocher',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      label: 'Option',
      value: false
    },
    styles: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer'
    },
    attributes: {
      type: 'checkbox',
      name: 'checkbox',
      class: 'checkbox'
    }
  }
};

export const RADIO_DEFINITION: ComponentDefinition = {
  type: 'radio',
  category: 'forms',
  displayName: 'Radio',
  icon: '◉',
  description: 'Bouton radio',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      label: 'Option',
      value: ''
    },
    styles: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer'
    },
    attributes: {
      type: 'radio',
      name: 'radio',
      class: 'radio'
    }
  }
};

export const BUTTON_DEFINITION: ComponentDefinition = {
  type: 'button',
  category: 'forms',
  displayName: 'Button',
  icon: '🔘',
  description: 'Bouton cliquable',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      text: 'Cliquez ici'
    },
    styles: {
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#ffffff',
      backgroundColor: '#4a90e2',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    attributes: {
      type: 'button',
      class: 'button'
    }
  }
};

// ============================================
// CONTENT COMPONENTS
// ============================================

export const HEADING_DEFINITION: ComponentDefinition = {
  type: 'heading',
  category: 'content',
  displayName: 'Heading',
  icon: 'H',
  description: 'Titre de section',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      text: 'Titre de section'
    },
    styles: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#333333',
      margin: '0 0 16px 0',
      lineHeight: '1.2'
    },
    attributes: {
      class: 'heading'
    }
  }
};

export const PARAGRAPH_DEFINITION: ComponentDefinition = {
  type: 'paragraph',
  category: 'content',
  displayName: 'Paragraph',
  icon: '¶',
  description: 'Paragraphe de texte',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      text: 'Ceci est un paragraphe de texte. Vous pouvez le modifier en cliquant dessus.'
    },
    styles: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#666666',
      margin: '0 0 16px 0'
    },
    attributes: {
      class: 'paragraph'
    }
  }
};

export const LIST_DEFINITION: ComponentDefinition = {
  type: 'list',
  category: 'content',
  displayName: 'List',
  icon: '≡',
  description: 'Liste à puces ou numérotée',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      margin: '0 0 16px 0',
      padding: '0 0 0 24px',
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#666666'
    },
    attributes: {
      class: 'list'
    }
  }
};

export const TABLE_DEFINITION: ComponentDefinition = {
  type: 'table',
  category: 'content',
  displayName: 'Table',
  icon: '⊞',
  description: 'Tableau de données',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      width: '100%',
      borderCollapse: 'collapse',
      margin: '0 0 20px 0',
      fontSize: '14px'
    },
    attributes: {
      class: 'table'
    }
  }
};

export const CODE_DEFINITION: ComponentDefinition = {
  type: 'code',
  category: 'content',
  displayName: 'Code Block',
  icon: '</>',
  description: 'Bloc de code avec coloration syntaxique',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      text: '// Votre code ici\nconsole.log("Hello World");'
    },
    styles: {
      display: 'block',
      padding: '16px',
      backgroundColor: '#f5f5f5',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#333333',
      overflow: 'auto',
      margin: '0 0 16px 0'
    },
    attributes: {
      class: 'code'
    }
  }
};

// ============================================
// MEDIA COMPONENTS
// ============================================

export const IMAGE_DEFINITION: ComponentDefinition = {
  type: 'image',
  category: 'media',
  displayName: 'Image',
  icon: '🖼',
  description: 'Image',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      src: 'https://via.placeholder.com/800x400',
      alt: 'Image description'
    },
    styles: {
      width: '100%',
      height: 'auto',
      maxWidth: '100%',
      display: 'block',
      borderRadius: '4px'
    },
    attributes: {
      class: 'image',
      loading: 'lazy'
    }
  }
};

export const VIDEO_DEFINITION: ComponentDefinition = {
  type: 'video',
  category: 'media',
  displayName: 'Video',
  icon: '🎬',
  description: 'Lecteur vidéo',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      src: ''
    },
    styles: {
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '4px'
    },
    attributes: {
      class: 'video',
      controls: true
    }
  }
};

export const ICON_DEFINITION: ComponentDefinition = {
  type: 'icon',
  category: 'media',
  displayName: 'Icon',
  icon: '⭐',
  description: 'Icône SVG ou emoji',
  canHaveChildren: false,
  defaultProperties: {
    content: {
      text: '⭐'
    },
    styles: {
      fontSize: '32px',
      display: 'inline-block',
      lineHeight: '1'
    },
    attributes: {
      class: 'icon'
    }
  }
};

export const GALLERY_DEFINITION: ComponentDefinition = {
  type: 'gallery',
  category: 'media',
  displayName: 'Gallery',
  icon: '🖼️',
  description: 'Galerie d\'images',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      width: '100%'
    },
    attributes: {
      class: 'gallery'
    }
  }
};

// ============================================
// CUSTOM COMPONENTS
// ============================================

export const CARD_DEFINITION: ComponentDefinition = {
  type: 'card',
  category: 'custom',
  displayName: 'Card',
  icon: '🃏',
  description: 'Carte avec contenu',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      display: 'block',
      padding: '24px',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    attributes: {
      class: 'card'
    }
  }
};

export const MODAL_DEFINITION: ComponentDefinition = {
  type: 'modal',
  category: 'custom',
  displayName: 'Modal',
  icon: '⊡',
  description: 'Fenêtre modale',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      display: 'none',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      backgroundColor: '#ffffff',
      padding: '32px',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: '1000'
    },
    attributes: {
      class: 'modal'
    }
  }
};

export const TABS_DEFINITION: ComponentDefinition = {
  type: 'tabs',
  category: 'custom',
  displayName: 'Tabs',
  icon: '📑',
  description: 'Onglets de navigation',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      display: 'block',
      width: '100%'
    },
    attributes: {
      class: 'tabs'
    }
  }
};

export const ACCORDION_DEFINITION: ComponentDefinition = {
  type: 'accordion',
  category: 'custom',
  displayName: 'Accordion',
  icon: '≣',
  description: 'Accordéon pliable',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      display: 'block',
      width: '100%',
      border: '1px solid #e0e0e0',
      borderRadius: '4px'
    },
    attributes: {
      class: 'accordion'
    }
  }
};

export const CAROUSEL_DEFINITION: ComponentDefinition = {
  type: 'carousel',
  category: 'custom',
  displayName: 'Carousel',
  icon: '⟲',
  description: 'Carrousel d\'éléments',
  canHaveChildren: true,
  defaultProperties: {
    content: {},
    styles: {
      display: 'block',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    },
    attributes: {
      class: 'carousel'
    }
  }
};

// ============================================
// CATALOGUE COMPLET
// ============================================

/**
 * Catalogue complet de tous les composants disponibles
 * Organisé par catégorie pour faciliter l'accès
 */
export const COMPONENT_CATALOG: Record<string, ComponentDefinition[]> = {
  layout: [
    CONTAINER_DEFINITION,
    SECTION_DEFINITION,
    GRID_DEFINITION,
    FLEXBOX_DEFINITION,
    DIVIDER_DEFINITION
  ],
  forms: [
    INPUT_DEFINITION,
    TEXTAREA_DEFINITION,
    SELECT_DEFINITION,
    CHECKBOX_DEFINITION,
    RADIO_DEFINITION,
    BUTTON_DEFINITION
  ],
  content: [
    HEADING_DEFINITION,
    PARAGRAPH_DEFINITION,
    LIST_DEFINITION,
    TABLE_DEFINITION,
    CODE_DEFINITION
  ],
  media: [
    IMAGE_DEFINITION,
    VIDEO_DEFINITION,
    ICON_DEFINITION,
    GALLERY_DEFINITION
  ],
  custom: [
    CARD_DEFINITION,
    MODAL_DEFINITION,
    TABS_DEFINITION,
    ACCORDION_DEFINITION,
    CAROUSEL_DEFINITION
  ]
};

/**
 * Liste plate de toutes les définitions de composants
 */
export const ALL_COMPONENTS: ComponentDefinition[] = Object.values(COMPONENT_CATALOG).flat();

/**
 * Map pour accéder rapidement à une définition par son type
 */
export const COMPONENT_DEFINITIONS_MAP: Map<string, ComponentDefinition> = new Map(
  ALL_COMPONENTS.map(def => [def.type, def])
);