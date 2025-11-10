/**
 * Elementor JSON Template Type Definitions
 * Based on Elementor's template import/export format
 */

/**
 * Main Elementor template structure
 */
export interface ElementorTemplate {
  version: string;
  title: string;
  type: 'page' | 'section' | 'widget';
  content: ElementorElement[];
}

/**
 * Base element type - can be section, column, or widget
 */
export interface ElementorElement {
  id: string;
  elType: 'section' | 'column' | 'widget';
  settings?: ElementorSettings;
  elements?: ElementorElement[];
  isInner?: boolean;
  widgetType?: string;
}

/**
 * Settings for Elementor elements
 * This includes layout, styling, and content settings
 */
export interface ElementorSettings {
  // General settings
  _element_id?: string;

  // Layout settings
  layout?: 'boxed' | 'full_width';
  content_width?: string;
  gap?: 'default' | 'no' | 'narrow' | 'extended' | 'wide' | 'wider';
  height?: 'default' | 'full' | 'min-height';
  column_position?: 'top' | 'middle' | 'bottom' | 'stretch';

  // Spacing
  padding?: ElementorDimensions;
  margin?: ElementorDimensions;

  // Background
  background_background?: 'classic' | 'gradient';
  background_color?: string;
  background_image?: ElementorImage;

  // Border
  border_border?: string;
  border_width?: ElementorDimensions;
  border_color?: string;
  border_radius?: ElementorDimensions;

  // Typography
  typography_typography?: 'custom';
  typography_font_family?: string;
  typography_font_size?: ElementorSize;
  typography_font_weight?: string;
  typography_line_height?: ElementorSize;
  typography_letter_spacing?: ElementorSize;
  text_color?: string;

  // Widget-specific settings
  title?: string;
  editor?: string;
  text?: string;
  link?: ElementorLink;
  image?: ElementorImage;
  align?: 'left' | 'center' | 'right' | 'justify';
  html?: string;

  // Form fields
  form_fields?: ElementorFormField[];

  // Additional custom settings
  [key: string]: any;
}

/**
 * Dimensions for padding, margin, border, etc.
 */
export interface ElementorDimensions {
  unit?: 'px' | '%' | 'em' | 'rem' | 'vh' | 'vw';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  isLinked?: boolean;
}

/**
 * Size specification with unit
 */
export interface ElementorSize {
  unit?: 'px' | '%' | 'em' | 'rem' | 'vh' | 'vw';
  size?: string | number;
}

/**
 * Image settings
 */
export interface ElementorImage {
  url?: string;
  id?: string;
  alt?: string;
}

/**
 * Link settings
 */
export interface ElementorLink {
  url?: string;
  is_external?: boolean;
  nofollow?: boolean;
  custom_attributes?: string;
}

/**
 * Form field definition
 */
export interface ElementorFormField {
  _id: string;
  field_type: 'text' | 'email' | 'textarea' | 'url' | 'tel' | 'radio' | 'select' | 'checkbox' | 'acceptance' | 'number' | 'date' | 'time' | 'file' | 'password' | 'html';
  field_label?: string;
  placeholder?: string;
  required?: boolean;
  field_options?: string;
  field_value?: string;
  width?: string;
}

/**
 * Widget types supported by Elementor
 */
export type ElementorWidgetType =
  | 'heading'
  | 'text-editor'
  | 'image'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'google_maps'
  | 'icon'
  | 'icon-box'
  | 'image-box'
  | 'star-rating'
  | 'image-carousel'
  | 'image-gallery'
  | 'icon-list'
  | 'counter'
  | 'progress'
  | 'testimonial'
  | 'tabs'
  | 'accordion'
  | 'toggle'
  | 'social-icons'
  | 'alert'
  | 'audio'
  | 'shortcode'
  | 'html'
  | 'menu-anchor'
  | 'sidebar'
  | 'video'
  | 'form';
