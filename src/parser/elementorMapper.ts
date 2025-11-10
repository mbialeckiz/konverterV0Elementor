/**
 * Elementor Mapper - Converts intermediate components to Elementor JSON
 */

import {
  ElementorTemplate,
  ElementorElement,
  ElementorSettings,
  ElementorWidgetType,
} from '../types/elementor';
import { IntermediateComponent } from '../types/internal';
import { convertStylesToElementor, extractGapSetting } from './styleMapper';

let elementIdCounter = 0;

/**
 * Generate unique element ID
 */
function generateElementId(): string {
  return `elem_${Date.now()}_${elementIdCounter++}`;
}

/**
 * Convert intermediate components to Elementor template
 */
export function convertToElementor(
  components: IntermediateComponent[],
  title: string = 'Converted Template'
): ElementorTemplate {
  const sections: ElementorElement[] = [];

  for (const component of components) {
    const section = convertComponentToSection(component);
    if (section) {
      sections.push(section);
    }
  }

  // If no sections were created, create a default section
  if (sections.length === 0) {
    sections.push(createDefaultSection(components));
  }

  return {
    version: '0.4',
    title,
    type: 'page',
    content: sections,
  };
}

/**
 * Convert a component to an Elementor section
 */
function convertComponentToSection(component: IntermediateComponent): ElementorElement | null {
  // Check if component is section-like
  if (component.type === 'section' || component.type === 'container') {
    return createSection(component);
  }

  // Otherwise, wrap it in a section
  return createSection({
    type: 'section',
    children: [component],
  });
}

/**
 * Create an Elementor section
 */
function createSection(component: IntermediateComponent): ElementorElement {
  const settings: ElementorSettings = {
    layout: 'boxed',
    ...convertStylesToElementor(component.styles || {}, component.attributes?.className),
  };

  // Extract gap if flex container
  if (component.styles?.display === 'flex' && component.styles.gap) {
    settings.gap = extractGapSetting(component.styles) as any;
  }

  // Create columns from children
  const columns: ElementorElement[] = [];

  if (component.children && component.children.length > 0) {
    // Group children into columns based on layout
    const columnGroups = groupChildrenIntoColumns(component.children, component.styles);

    for (const group of columnGroups) {
      columns.push(createColumn(group));
    }
  }

  // If no columns, create an empty column
  if (columns.length === 0) {
    columns.push(createColumn([]));
  }

  return {
    id: generateElementId(),
    elType: 'section',
    settings,
    elements: columns,
  };
}

/**
 * Group children into columns based on layout
 */
function groupChildrenIntoColumns(
  children: IntermediateComponent[],
  styles?: any
): IntermediateComponent[][] {
  // If flex-row, each direct child becomes a column
  if (styles?.display === 'flex' && styles?.flexDirection === 'row') {
    return children.map((child) => [child]);
  }

  // Otherwise, all children go into a single column
  return [children];
}

/**
 * Create an Elementor column
 */
function createColumn(children: IntermediateComponent[]): ElementorElement {
  const widgets: ElementorElement[] = children
    .map((child) => convertToWidget(child))
    .filter((w): w is ElementorElement => w !== null);

  return {
    id: generateElementId(),
    elType: 'column',
    settings: {},
    elements: widgets,
  };
}

/**
 * Convert intermediate component to Elementor widget
 */
function convertToWidget(component: IntermediateComponent): ElementorElement | null {
  const widgetType = mapComponentToWidgetType(component);

  if (!widgetType) {
    // If it's a container with children, create inner section
    if (component.children && component.children.length > 0) {
      return createInnerSection(component);
    }
    return null;
  }

  const settings = createWidgetSettings(component, widgetType);

  return {
    id: generateElementId(),
    elType: 'widget',
    widgetType,
    settings,
  };
}

/**
 * Map intermediate component type to Elementor widget type
 */
function mapComponentToWidgetType(component: IntermediateComponent): ElementorWidgetType | null {
  const mappings: Record<string, ElementorWidgetType> = {
    heading: 'heading',
    text: 'text-editor',
    image: 'image',
    button: 'button',
    video: 'video',
    form: 'form',
  };

  return mappings[component.type] || null;
}

/**
 * Create widget settings based on component type
 */
function createWidgetSettings(
  component: IntermediateComponent,
  widgetType: ElementorWidgetType
): ElementorSettings {
  const baseSettings = convertStylesToElementor(
    component.styles || {},
    component.attributes?.className
  );

  switch (widgetType) {
    case 'heading':
      return {
        ...baseSettings,
        title: component.content || extractTextFromChildren(component.children),
        // Determine heading level from element name or default to h2
        tag: determineHeadingTag(component),
      };

    case 'text-editor':
      return {
        ...baseSettings,
        editor: component.content || extractTextFromChildren(component.children),
      };

    case 'image':
      return {
        ...baseSettings,
        image: {
          url: component.attributes?.src || '',
          alt: component.attributes?.alt || '',
        },
      };

    case 'button':
      return {
        ...baseSettings,
        text: component.content || extractTextFromChildren(component.children),
        link: {
          url: component.attributes?.href || '#',
          is_external: false,
          nofollow: false,
        },
        align: component.styles?.textAlign as any || 'left',
      };

    case 'video':
      return {
        ...baseSettings,
        video_type: 'hosted',
        hosted_url: component.attributes?.src || '',
      };

    case 'form':
      return {
        ...baseSettings,
        form_fields: createFormFields(component.children || []),
      };

    default:
      return baseSettings;
  }
}

/**
 * Determine heading tag (h1-h6)
 */
function determineHeadingTag(component: IntermediateComponent): string {
  // Check if original element was h1-h6
  const className = component.attributes?.className || '';
  for (let i = 1; i <= 6; i++) {
    if (className.includes(`h${i}`) || className.includes(`heading-${i}`)) {
      return `h${i}`;
    }
  }

  // Check text size to infer heading level
  const fontSize = component.styles?.fontSize;
  if (fontSize) {
    const size = parseFloat(fontSize);
    if (size >= 48) return 'h1';
    if (size >= 36) return 'h2';
    if (size >= 28) return 'h3';
    if (size >= 24) return 'h4';
    if (size >= 20) return 'h5';
    return 'h6';
  }

  return 'h2'; // Default
}

/**
 * Extract text content from children
 */
function extractTextFromChildren(children?: IntermediateComponent[]): string {
  if (!children || children.length === 0) return '';

  return children
    .map((child) => {
      if (child.content) return child.content;
      if (child.children) return extractTextFromChildren(child.children);
      return '';
    })
    .join(' ')
    .trim();
}

/**
 * Create inner section for nested containers
 */
function createInnerSection(component: IntermediateComponent): ElementorElement {
  const columns = groupChildrenIntoColumns(component.children || [], component.styles).map(
    (group) => createColumn(group)
  );

  return {
    id: generateElementId(),
    elType: 'section',
    isInner: true,
    settings: convertStylesToElementor(component.styles || {}, component.attributes?.className),
    elements: columns,
  };
}

/**
 * Create form fields from form children
 */
function createFormFields(children: IntermediateComponent[]): any[] {
  const fields: any[] = [];
  let fieldCounter = 0;

  for (const child of children) {
    if (child.type === 'input') {
      const inputType = child.attributes?.type || 'text';
      let fieldType: any = 'text';

      // Map input types to Elementor form field types
      if (inputType === 'email') fieldType = 'email';
      else if (inputType === 'tel') fieldType = 'tel';
      else if (inputType === 'number') fieldType = 'number';
      else if (inputType === 'url') fieldType = 'url';
      else if (inputType === 'password') fieldType = 'password';

      fields.push({
        _id: `field_${fieldCounter++}`,
        field_type: fieldType,
        field_label: child.attributes?.placeholder || child.attributes?.name || 'Field',
        placeholder: child.attributes?.placeholder || '',
        required: child.attributes?.required || false,
        width: '100',
      });
    } else if (child.type === 'textarea') {
      fields.push({
        _id: `field_${fieldCounter++}`,
        field_type: 'textarea',
        field_label: child.attributes?.placeholder || 'Message',
        placeholder: child.attributes?.placeholder || '',
        required: child.attributes?.required || false,
        width: '100',
      });
    } else if (child.type === 'select') {
      fields.push({
        _id: `field_${fieldCounter++}`,
        field_type: 'select',
        field_label: child.attributes?.name || 'Select',
        field_options: extractSelectOptions(child.children || []),
        width: '100',
      });
    }
  }

  return fields;
}

/**
 * Extract options from select element
 */
function extractSelectOptions(children: IntermediateComponent[]): string {
  return children
    .filter((c) => c.type === 'option')
    .map((c) => c.content || c.attributes?.value || '')
    .join('\n');
}

/**
 * Create a default section with all components
 */
function createDefaultSection(components: IntermediateComponent[]): ElementorElement {
  return createSection({
    type: 'section',
    children: components,
  });
}

/**
 * Validate Elementor template structure
 */
export function validateElementorTemplate(template: ElementorTemplate): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!template.version) {
    errors.push('Template version is missing');
  }

  if (!template.title) {
    errors.push('Template title is missing');
  }

  if (!template.content || template.content.length === 0) {
    errors.push('Template has no content');
  }

  // Validate structure
  for (const section of template.content || []) {
    if (section.elType !== 'section') {
      errors.push(`Invalid element type at root level: ${section.elType}`);
    }

    if (!section.elements || section.elements.length === 0) {
      errors.push(`Section ${section.id} has no columns`);
    }

    for (const column of section.elements || []) {
      if (column.elType !== 'column') {
        errors.push(`Invalid element type in section: ${column.elType}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
