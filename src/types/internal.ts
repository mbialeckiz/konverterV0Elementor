/**
 * Internal representation types for the conversion process
 * These are intermediate structures used during React -> Elementor conversion
 */

/**
 * Intermediate component representation
 * This is the bridge between React components and Elementor elements
 */
export interface IntermediateComponent {
  type: IntermediateComponentType;
  content?: string;
  attributes?: Record<string, any>;
  styles?: StyleAttributes;
  children?: IntermediateComponent[];
  props?: Record<string, any>;
}

/**
 * Types of intermediate components we can parse from React
 */
export type IntermediateComponentType =
  | 'section'
  | 'container'
  | 'column'
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'link'
  | 'list'
  | 'listItem'
  | 'form'
  | 'input'
  | 'textarea'
  | 'select'
  | 'div'
  | 'span'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'video'
  | 'audio'
  | 'unknown';

/**
 * Style attributes extracted from components
 */
export interface StyleAttributes {
  // Layout
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;

  // Spacing
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Size
  width?: string;
  height?: string;
  maxWidth?: string;
  minHeight?: string;

  // Colors
  color?: string;
  backgroundColor?: string;

  // Typography
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;
  textAlign?: string;
  letterSpacing?: string;

  // Border
  border?: string;
  borderRadius?: string;
  borderColor?: string;
  borderWidth?: string;

  // Other
  [key: string]: any;
}

/**
 * Parsing context - maintains state during parsing
 */
export interface ParsingContext {
  currentFile: string;
  componentName?: string;
  depth: number;
  warnings: string[];
  mappedWidgets: number;
  unmappedElements: string[];
}

/**
 * Configuration options for the converter
 */
export interface ConverterOptions {
  repoUrl?: string;
  localPath?: string;
  outputPath: string;
  templateTitle?: string;
  verbose?: boolean;
  includeTailwind?: boolean;
}

/**
 * Result of a conversion operation
 */
export interface ConversionResult {
  success: boolean;
  outputPath?: string;
  warnings: string[];
  errors: string[];
  stats: ConversionStats;
}

/**
 * Statistics about the conversion
 */
export interface ConversionStats {
  filesProcessed: number;
  componentsFound: number;
  widgetsMapped: number;
  elementsUnmapped: number;
  duration: number;
}

/**
 * React component metadata extracted from AST
 */
export interface ComponentMetadata {
  name: string;
  filePath: string;
  isDefaultExport: boolean;
  props?: Record<string, any>;
  imports: string[];
}
