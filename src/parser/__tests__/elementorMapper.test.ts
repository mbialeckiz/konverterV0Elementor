/**
 * Unit tests for Elementor Mapper
 */

import { convertToElementor, validateElementorTemplate } from '../elementorMapper';
import { IntermediateComponent } from '../../types/internal';

describe('ElementorMapper', () => {
  describe('convertToElementor', () => {
    test('converts simple heading to Elementor heading widget', () => {
      const components: IntermediateComponent[] = [
        {
          type: 'heading',
          content: 'Hello World',
        },
      ];

      const result = convertToElementor(components, 'Test Template');

      expect(result.version).toBe('0.4');
      expect(result.title).toBe('Test Template');
      expect(result.type).toBe('page');
      expect(result.content).toHaveLength(1);

      const section = result.content[0];
      expect(section.elType).toBe('section');
      expect(section.elements).toHaveLength(1);

      const column = section.elements![0];
      expect(column.elType).toBe('column');
      expect(column.elements).toHaveLength(1);

      const widget = column.elements![0];
      expect(widget.elType).toBe('widget');
      expect(widget.widgetType).toBe('heading');
      expect(widget.settings?.title).toBe('Hello World');
    });

    test('converts text paragraph to text-editor widget', () => {
      const components: IntermediateComponent[] = [
        {
          type: 'text',
          content: 'This is a paragraph',
        },
      ];

      const result = convertToElementor(components);
      const widget = result.content[0].elements![0].elements![0];

      expect(widget.widgetType).toBe('text-editor');
      expect(widget.settings?.editor).toBe('This is a paragraph');
    });

    test('converts image to image widget', () => {
      const components: IntermediateComponent[] = [
        {
          type: 'image',
          attributes: {
            src: 'https://example.com/image.jpg',
            alt: 'Test Image',
          },
        },
      ];

      const result = convertToElementor(components);
      const widget = result.content[0].elements![0].elements![0];

      expect(widget.widgetType).toBe('image');
      expect(widget.settings?.image?.url).toBe('https://example.com/image.jpg');
      expect(widget.settings?.image?.alt).toBe('Test Image');
    });

    test('converts button to button widget', () => {
      const components: IntermediateComponent[] = [
        {
          type: 'button',
          content: 'Click Me',
          attributes: {
            href: 'https://example.com',
          },
        },
      ];

      const result = convertToElementor(components);
      const widget = result.content[0].elements![0].elements![0];

      expect(widget.widgetType).toBe('button');
      expect(widget.settings?.text).toBe('Click Me');
      expect(widget.settings?.link?.url).toBe('https://example.com');
    });

    test('converts nested components to sections and columns', () => {
      const components: IntermediateComponent[] = [
        {
          type: 'section',
          children: [
            {
              type: 'heading',
              content: 'Title',
            },
            {
              type: 'text',
              content: 'Description',
            },
          ],
        },
      ];

      const result = convertToElementor(components);
      const section = result.content[0];
      const column = section.elements![0];

      expect(column.elements).toHaveLength(2);
      expect(column.elements![0].widgetType).toBe('heading');
      expect(column.elements![1].widgetType).toBe('text-editor');
    });

    test('applies styles to widgets', () => {
      const components: IntermediateComponent[] = [
        {
          type: 'heading',
          content: 'Styled Heading',
          styles: {
            color: '#ff0000',
            fontSize: '24px',
          },
        },
      ];

      const result = convertToElementor(components);
      const widget = result.content[0].elements![0].elements![0];

      expect(widget.settings?.text_color).toBe('#ff0000');
      expect(widget.settings?.typography_font_size?.size).toBe('24');
      expect(widget.settings?.typography_font_size?.unit).toBe('px');
    });

    test('handles empty components array', () => {
      const components: IntermediateComponent[] = [];
      const result = convertToElementor(components);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].elType).toBe('section');
    });
  });

  describe('validateElementorTemplate', () => {
    test('validates correct template structure', () => {
      const template = {
        version: '0.4',
        title: 'Test',
        type: 'page' as const,
        content: [
          {
            id: '1',
            elType: 'section' as const,
            elements: [
              {
                id: '2',
                elType: 'column' as const,
                elements: [],
              },
            ],
          },
        ],
      };

      const result = validateElementorTemplate(template);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects missing version', () => {
      const template = {
        version: '',
        title: 'Test',
        type: 'page' as const,
        content: [],
      };

      const result = validateElementorTemplate(template);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template version is missing');
    });

    test('detects empty content', () => {
      const template = {
        version: '0.4',
        title: 'Test',
        type: 'page' as const,
        content: [],
      };

      const result = validateElementorTemplate(template);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Template has no content');
    });
  });
});
