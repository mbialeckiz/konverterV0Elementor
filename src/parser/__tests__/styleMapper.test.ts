/**
 * Unit tests for Style Mapper
 */

import { parseTailwindClasses, convertStylesToElementor } from '../styleMapper';

describe('StyleMapper', () => {
  describe('parseTailwindClasses', () => {
    test('parses padding classes', () => {
      const styles = parseTailwindClasses('p-4');
      expect(styles.padding).toBe('1rem');
    });

    test('parses margin classes', () => {
      const styles = parseTailwindClasses('m-8');
      expect(styles.margin).toBe('2rem');
    });

    test('parses padding x and y', () => {
      const styles = parseTailwindClasses('px-6 py-4');
      expect(styles.paddingLeft).toBe('1.5rem');
      expect(styles.paddingRight).toBe('1.5rem');
      expect(styles.paddingTop).toBe('1rem');
      expect(styles.paddingBottom).toBe('1rem');
    });

    test('parses text color', () => {
      const styles = parseTailwindClasses('text-blue-500');
      expect(styles.color).toBe('#3b82f6');
    });

    test('parses background color', () => {
      const styles = parseTailwindClasses('bg-gray-100');
      expect(styles.backgroundColor).toBe('#f3f4f6');
    });

    test('parses font size', () => {
      const styles = parseTailwindClasses('text-xl');
      expect(styles.fontSize).toBe('1.25rem');
    });

    test('parses font weight', () => {
      const styles = parseTailwindClasses('font-bold');
      expect(styles.fontWeight).toBe('700');
    });

    test('parses flex display', () => {
      const styles = parseTailwindClasses('flex flex-col items-center justify-between');
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
      expect(styles.alignItems).toBe('center');
      expect(styles.justifyContent).toBe('space-between');
    });

    test('parses gap', () => {
      const styles = parseTailwindClasses('gap-4');
      expect(styles.gap).toBe('1rem');
    });

    test('parses width and height', () => {
      const styles = parseTailwindClasses('w-full h-64');
      expect(styles.width).toBe('100%');
      expect(styles.height).toBe('16rem');
    });

    test('parses border radius', () => {
      const styles = parseTailwindClasses('rounded-lg');
      expect(styles.borderRadius).toBe('2rem');
    });

    test('parses rounded-full', () => {
      const styles = parseTailwindClasses('rounded-full');
      expect(styles.borderRadius).toBe('9999px');
    });

    test('parses text alignment', () => {
      const styles = parseTailwindClasses('text-center');
      expect(styles.textAlign).toBe('center');
    });

    test('parses max width', () => {
      const styles = parseTailwindClasses('max-w-full');
      expect(styles.maxWidth).toBe('100%');
    });

    test('handles multiple classes', () => {
      const styles = parseTailwindClasses(
        'flex flex-col p-6 bg-white text-gray-900 font-bold text-2xl rounded-lg'
      );
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
      expect(styles.padding).toBe('1.5rem');
      expect(styles.backgroundColor).toBe('#ffffff');
      expect(styles.color).toBe('#111827');
      expect(styles.fontWeight).toBe('700');
      expect(styles.fontSize).toBe('1.5rem');
      expect(styles.borderRadius).toBe('2rem');
    });
  });

  describe('convertStylesToElementor', () => {
    test('converts padding to Elementor format', () => {
      const settings = convertStylesToElementor({ padding: '10px' });
      expect(settings.padding).toEqual({
        top: '10',
        right: '10',
        bottom: '10',
        left: '10',
        unit: 'px',
        isLinked: true,
      });
    });

    test('converts individual padding values', () => {
      const settings = convertStylesToElementor({
        paddingTop: '10px',
        paddingRight: '20px',
        paddingBottom: '10px',
        paddingLeft: '20px',
      });
      expect(settings.padding?.top).toBe('10px');
      expect(settings.padding?.right).toBe('20px');
      expect(settings.padding?.bottom).toBe('10px');
      expect(settings.padding?.left).toBe('20px');
    });

    test('converts background color', () => {
      const settings = convertStylesToElementor({ backgroundColor: '#ff0000' });
      expect(settings.background_background).toBe('classic');
      expect(settings.background_color).toBe('#ff0000');
    });

    test('converts text color', () => {
      const settings = convertStylesToElementor({ color: '#000000' });
      expect(settings.text_color).toBe('#000000');
    });

    test('converts typography settings', () => {
      const settings = convertStylesToElementor({
        fontSize: '16px',
        fontWeight: '600',
        fontFamily: 'Arial',
      });
      expect(settings.typography_typography).toBe('custom');
      expect(settings.typography_font_size?.size).toBe('16');
      expect(settings.typography_font_size?.unit).toBe('px');
      expect(settings.typography_font_weight).toBe('600');
      expect(settings.typography_font_family).toBe('Arial');
    });

    test('converts text alignment', () => {
      const settings = convertStylesToElementor({ textAlign: 'center' });
      expect(settings.align).toBe('center');
    });

    test('converts border radius', () => {
      const settings = convertStylesToElementor({ borderRadius: '5px' });
      expect(settings.border_radius).toEqual({
        top: '5',
        right: '5',
        bottom: '5',
        left: '5',
        unit: 'px',
        isLinked: true,
      });
    });

    test('merges Tailwind classes with inline styles', () => {
      const settings = convertStylesToElementor(
        { fontSize: '20px' },
        'text-blue-500 font-bold'
      );
      expect(settings.text_color).toBe('#3b82f6');
      expect(settings.typography_font_weight).toBe('700');
      expect(settings.typography_font_size?.size).toBe('20'); // Inline style should override
    });
  });
});
