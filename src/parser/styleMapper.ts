/**
 * Style Mapper - Converts CSS and Tailwind classes to Elementor settings
 */

import { ElementorSettings, ElementorDimensions, ElementorSize } from '../types/elementor';
import { StyleAttributes } from '../types/internal';

/**
 * Tailwind to CSS value mappings
 */
const TAILWIND_SPACING: Record<string, string> = {
  '0': '0',
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '8': '2rem',
  '10': '2.5rem',
  '12': '3rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '32': '8rem',
  '40': '10rem',
  '48': '12rem',
  '56': '14rem',
  '64': '16rem',
};

const TAILWIND_COLORS: Record<string, string> = {
  'white': '#ffffff',
  'black': '#000000',
  'gray-50': '#f9fafb',
  'gray-100': '#f3f4f6',
  'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db',
  'gray-400': '#9ca3af',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'gray-700': '#374151',
  'gray-800': '#1f2937',
  'gray-900': '#111827',
  'blue-500': '#3b82f6',
  'blue-600': '#2563eb',
  'blue-700': '#1d4ed8',
  'red-500': '#ef4444',
  'red-600': '#dc2626',
  'green-500': '#10b981',
  'green-600': '#059669',
  'yellow-500': '#eab308',
  'purple-500': '#a855f7',
};

const TAILWIND_FONT_SIZES: Record<string, string> = {
  'xs': '0.75rem',
  'sm': '0.875rem',
  'base': '1rem',
  'lg': '1.125rem',
  'xl': '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem',
};

const TAILWIND_FONT_WEIGHTS: Record<string, string> = {
  'thin': '100',
  'extralight': '200',
  'light': '300',
  'normal': '400',
  'medium': '500',
  'semibold': '600',
  'bold': '700',
  'extrabold': '800',
  'black': '900',
};

/**
 * Parse Tailwind classes and convert to inline styles
 */
export function parseTailwindClasses(className: string): StyleAttributes {
  const styles: StyleAttributes = {};
  const classes = className.split(/\s+/);

  for (const cls of classes) {
    // Padding
    if (cls.startsWith('p-')) {
      const value = TAILWIND_SPACING[cls.substring(2)];
      if (value) styles.padding = value;
    } else if (cls.startsWith('px-')) {
      const value = TAILWIND_SPACING[cls.substring(3)];
      if (value) {
        styles.paddingLeft = value;
        styles.paddingRight = value;
      }
    } else if (cls.startsWith('py-')) {
      const value = TAILWIND_SPACING[cls.substring(3)];
      if (value) {
        styles.paddingTop = value;
        styles.paddingBottom = value;
      }
    } else if (cls.startsWith('pt-')) {
      const value = TAILWIND_SPACING[cls.substring(3)];
      if (value) styles.paddingTop = value;
    } else if (cls.startsWith('pr-')) {
      const value = TAILWIND_SPACING[cls.substring(3)];
      if (value) styles.paddingRight = value;
    } else if (cls.startsWith('pb-')) {
      const value = TAILWIND_SPACING[cls.substring(3)];
      if (value) styles.paddingBottom = value;
    } else if (cls.startsWith('pl-')) {
      const value = TAILWIND_SPACING[cls.substring(3)];
      if (value) styles.paddingLeft = value;
    }

    // Margin
    else if (cls.startsWith('m-')) {
      const value = TAILWIND_SPACING[cls.substring(2)];
      if (value) styles.margin = value;
    } else if (cls.startsWith('mx-')) {
      const value = TAILWIND_SPACING[cls.substring(3)];
      if (value) {
        styles.marginLeft = value;
        styles.marginRight = value;
      }
    } else if (cls.startsWith('my-')) {
      const value = TAILWIND_SPACING[cls.substring(3)];
      if (value) {
        styles.marginTop = value;
        styles.marginBottom = value;
      }
    }

    // Text color
    else if (cls.startsWith('text-')) {
      const colorKey = cls.substring(5);
      const color = TAILWIND_COLORS[colorKey];
      if (color) {
        styles.color = color;
      } else if (colorKey in TAILWIND_FONT_SIZES) {
        styles.fontSize = TAILWIND_FONT_SIZES[colorKey];
      } else if (['left', 'center', 'right', 'justify'].includes(colorKey)) {
        styles.textAlign = colorKey;
      }
    }

    // Background color
    else if (cls.startsWith('bg-')) {
      const color = TAILWIND_COLORS[cls.substring(3)];
      if (color) styles.backgroundColor = color;
    }

    // Font weight
    else if (cls.startsWith('font-')) {
      const weight = TAILWIND_FONT_WEIGHTS[cls.substring(5)];
      if (weight) styles.fontWeight = weight;
    }

    // Flex
    else if (cls === 'flex') {
      styles.display = 'flex';
    } else if (cls === 'flex-col') {
      styles.flexDirection = 'column';
    } else if (cls === 'flex-row') {
      styles.flexDirection = 'row';
    } else if (cls.startsWith('justify-')) {
      const value = cls.substring(8);
      styles.justifyContent = value === 'between' ? 'space-between' : value;
    } else if (cls.startsWith('items-')) {
      styles.alignItems = cls.substring(6);
    } else if (cls.startsWith('gap-')) {
      const value = TAILWIND_SPACING[cls.substring(4)];
      if (value) styles.gap = value;
    }

    // Width
    else if (cls === 'w-full') {
      styles.width = '100%';
    } else if (cls.startsWith('w-')) {
      const value = TAILWIND_SPACING[cls.substring(2)];
      if (value) styles.width = value;
    }

    // Height
    else if (cls === 'h-full') {
      styles.height = '100%';
    } else if (cls.startsWith('h-')) {
      const value = TAILWIND_SPACING[cls.substring(2)];
      if (value) styles.height = value;
    }

    // Border radius
    else if (cls === 'rounded') {
      styles.borderRadius = '0.25rem';
    } else if (cls.startsWith('rounded-')) {
      const value = cls.substring(8);
      if (value === 'full') {
        styles.borderRadius = '9999px';
      } else {
        const spacing = TAILWIND_SPACING[value];
        if (spacing) styles.borderRadius = spacing;
      }
    }

    // Max width
    else if (cls.startsWith('max-w-')) {
      const value = cls.substring(6);
      if (value === 'full') {
        styles.maxWidth = '100%';
      } else if (value in TAILWIND_SPACING) {
        styles.maxWidth = TAILWIND_SPACING[value];
      } else {
        styles.maxWidth = value;
      }
    }
  }

  return styles;
}

/**
 * Convert style attributes to Elementor settings
 */
export function convertStylesToElementor(
  styles: StyleAttributes,
  className?: string
): Partial<ElementorSettings> {
  const settings: Partial<ElementorSettings> = {};

  // Merge Tailwind classes if present
  let allStyles = { ...styles };
  if (className) {
    const tailwindStyles = parseTailwindClasses(className);
    allStyles = { ...tailwindStyles, ...styles };
  }

  // Padding
  if (allStyles.padding) {
    settings.padding = parseDimension(allStyles.padding);
  } else if (
    allStyles.paddingTop ||
    allStyles.paddingRight ||
    allStyles.paddingBottom ||
    allStyles.paddingLeft
  ) {
    settings.padding = {
      top: allStyles.paddingTop || '0',
      right: allStyles.paddingRight || '0',
      bottom: allStyles.paddingBottom || '0',
      left: allStyles.paddingLeft || '0',
      unit: 'px',
      isLinked: false,
    };
  }

  // Margin
  if (allStyles.margin) {
    settings.margin = parseDimension(allStyles.margin);
  } else if (
    allStyles.marginTop ||
    allStyles.marginRight ||
    allStyles.marginBottom ||
    allStyles.marginLeft
  ) {
    settings.margin = {
      top: allStyles.marginTop || '0',
      right: allStyles.marginRight || '0',
      bottom: allStyles.marginBottom || '0',
      left: allStyles.marginLeft || '0',
      unit: 'px',
      isLinked: false,
    };
  }

  // Background
  if (allStyles.backgroundColor) {
    settings.background_background = 'classic';
    settings.background_color = allStyles.backgroundColor;
  }

  // Text color
  if (allStyles.color) {
    settings.text_color = allStyles.color;
  }

  // Typography
  if (allStyles.fontSize || allStyles.fontWeight || allStyles.fontFamily) {
    settings.typography_typography = 'custom';

    if (allStyles.fontSize) {
      settings.typography_font_size = parseSize(allStyles.fontSize);
    }
    if (allStyles.fontWeight) {
      settings.typography_font_weight = allStyles.fontWeight;
    }
    if (allStyles.fontFamily) {
      settings.typography_font_family = allStyles.fontFamily;
    }
    if (allStyles.lineHeight) {
      settings.typography_line_height = parseSize(allStyles.lineHeight);
    }
    if (allStyles.letterSpacing) {
      settings.typography_letter_spacing = parseSize(allStyles.letterSpacing);
    }
  }

  // Text alignment
  if (allStyles.textAlign) {
    settings.align = allStyles.textAlign as any;
  }

  // Border
  if (allStyles.border || allStyles.borderColor || allStyles.borderWidth) {
    settings.border_border = 'solid';
    if (allStyles.borderColor) {
      settings.border_color = allStyles.borderColor;
    }
    if (allStyles.borderWidth) {
      settings.border_width = parseDimension(allStyles.borderWidth);
    }
  }

  // Border radius
  if (allStyles.borderRadius) {
    settings.border_radius = parseDimension(allStyles.borderRadius);
  }

  return settings;
}

/**
 * Parse a CSS dimension value (e.g., "10px", "2rem", "50%")
 */
function parseDimension(value: string): ElementorDimensions {
  const match = value.match(/^(-?\d+\.?\d*)(px|%|em|rem|vh|vw)?$/);

  if (match) {
    return {
      top: match[1],
      right: match[1],
      bottom: match[1],
      left: match[1],
      unit: (match[2] as any) || 'px',
      isLinked: true,
    };
  }

  return {
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    unit: 'px',
    isLinked: true,
  };
}

/**
 * Parse a CSS size value
 */
function parseSize(value: string): ElementorSize {
  const match = value.match(/^(-?\d+\.?\d*)(px|%|em|rem|vh|vw)?$/);

  if (match) {
    return {
      size: match[1],
      unit: (match[2] as any) || 'px',
    };
  }

  return {
    size: value,
    unit: 'px',
  };
}

/**
 * Extract gap/spacing from flex containers
 */
export function extractGapSetting(styles: StyleAttributes): string {
  if (styles.gap) {
    // Convert gap to Elementor's gap options
    const gapValue = parseFloat(styles.gap);
    if (gapValue === 0) return 'no';
    if (gapValue <= 10) return 'narrow';
    if (gapValue <= 20) return 'default';
    if (gapValue <= 30) return 'extended';
    if (gapValue <= 40) return 'wide';
    return 'wider';
  }
  return 'default';
}
