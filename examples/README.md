# Example Files

This directory contains example input and output files to demonstrate the React to Elementor converter.

## Files

### sample-component.tsx
A complete React component built with V0.dev style, featuring:
- Multiple sections (Hero, Features, CTA)
- Tailwind CSS classes
- Responsive layout with flexbox
- Heading hierarchy (h1, h2, h3)
- Buttons with styling
- Text content

### expected-output.json
The expected Elementor JSON output after converting the sample component. This shows:
- Proper section/column/widget structure
- Style mapping from Tailwind to Elementor settings
- Typography settings
- Spacing and padding conversion
- Color mapping
- Button widgets with links

## Usage

To convert the sample component:

```bash
# From project root
npm run convert -- --local ./examples --output ./examples/output.json --title "Landing Page Template"
```

This will:
1. Parse the `sample-component.tsx` file
2. Convert it to Elementor JSON format
3. Save the output to `examples/output.json`

You can then compare the generated `output.json` with `expected-output.json` to see how the conversion works.

## Testing the Output

1. Convert the sample component as shown above
2. Log in to your WordPress site
3. Go to **Elementor → Templates**
4. Click **Import Template**
5. Upload the generated `output.json` file
6. Edit the template in Elementor to see the converted layout

## Key Conversion Points

### Sections
- `<section>` elements become Elementor sections
- Background colors are preserved
- Padding is converted from Tailwind classes

### Headings
- `<h1>`, `<h2>`, `<h3>` become Elementor heading widgets
- Font sizes are converted (e.g., `text-5xl` → `3rem`)
- Font weights are mapped (e.g., `font-bold` → `700`)
- Text colors are preserved

### Text
- `<p>` elements become text-editor widgets
- Text alignment is preserved
- Color and typography settings are maintained

### Buttons
- `<button>` elements become button widgets
- Background colors, text colors, and padding are converted
- Border radius is preserved
- Links can be added via the href attribute

### Layout
- `flex` containers create appropriate column structures
- `flex-row` creates multiple columns
- `flex-col` stacks elements vertically
- Gap spacing is converted to Elementor's gap settings
