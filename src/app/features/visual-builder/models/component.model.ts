export type ComponentType =
  // Layout
  | 'container'
  | 'section'
  | 'grid'
  | 'flexbox'
  | 'divider'
  // Forms
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'button'
  // Content
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'table'
  | 'code'
  // Media
  | 'image'
  | 'video'
  | 'icon'
  | 'gallery'
  // Custom
  | 'card'
  | 'modal'
  | 'tabs'
  | 'accordion'
  | 'carousel';

/**
 * Catégorie d'un composant
 */
export type ComponentCategory = 'layout' | 'forms' | 'content' | 'media' | 'custom';

/**
 * Styles CSS applicables à un composant
 */
export interface ComponentStyles {
  // Layout
  display?: string;
  position?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  
  // Spacing
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  
  // Colors
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  
  // Typography
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;
  textAlign?: string;
  textDecoration?: string;
  
  // Border
  border?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;
  
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  
  // Other
  opacity?: string;
  cursor?: string;
  overflow?: string;
  boxShadow?: string;
  transition?: string;
  
  // Custom properties
  [key: string]: string | undefined;
}

/**
 * Propriétés d'un composant
 */
export interface ComponentProperties {
  // Contenu
  content?: {
    text?: string;
    html?: string;
    src?: string;
    alt?: string;
    href?: string;
    placeholder?: string;
    value?: any;
    label?: string;
  };
  
  // Styles
  styles: ComponentStyles;
  
  // Attributs HTML
  attributes: {
    id?: string;
    class?: string;
    name?: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    target?: string;
    [key: string]: any;
  };
  
  // Événements
  events?: {
    onClick?: string;
    onChange?: string;
    onSubmit?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Modèle principal d'un composant dans le builder
 */
export interface BuilderComponent {
  // Identifiant unique
  id: string;
  
  // Type de composant
  type: ComponentType;
  
  // Catégorie
  category: ComponentCategory;
  
  // Nom d'affichage
  displayName: string;
  
  // Propriétés du composant
  properties: ComponentProperties;
  
  // Composants enfants (pour les containers)
  children?: BuilderComponent[];
  
  // ID du parent
  parentId?: string;
  
  // Position dans la liste des enfants du parent
  order: number;
  
  // État
  isLocked?: boolean;
  isHidden?: boolean;
  isSelected?: boolean;
}

/**
 * Définition d'un composant (template de base)
 */
export interface ComponentDefinition {
  type: ComponentType;
  category: ComponentCategory;
  displayName: string;
  icon: string;
  description: string;
  defaultProperties: Partial<ComponentProperties>;
  canHaveChildren: boolean;
  allowedParents?: ComponentType[];
  allowedChildren?: ComponentType[];
}