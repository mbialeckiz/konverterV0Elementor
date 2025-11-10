# React to Elementor Converter

A powerful Node.js + TypeScript CLI tool that converts React/TypeScript projects (exported from V0.dev) into fully functional Elementor JSON templates, ready for import into WordPress.

## 🎯 Features

- ✅ Parse React/TypeScript components using AST analysis
- ✅ Convert JSX elements to Elementor widgets
- ✅ Map Tailwind CSS classes to Elementor styles
- ✅ Support for GitHub repository fetching
- ✅ Comprehensive component mapping (headings, text, images, buttons, forms, etc.)
- ✅ Style conversion (colors, spacing, typography, borders)
- ✅ Nested component handling (sections, columns, inner sections)
- ✅ Full TypeScript support with type definitions
- ✅ Unit tested
- ✅ Production-ready CLI interface

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git (optional, for repository cloning)

## 🚀 Installation

```bash
# Clone this repository
git clone <your-repo-url>
cd konverterV0Elementor

# Install dependencies
npm install

# Build the project
npm run build
```

## 📖 Usage

### Basic Usage

Convert a GitHub repository:

```bash
npm run convert -- --repo https://github.com/username/your-v0-project
```

Convert a local directory:

```bash
npm run convert -- --local ./path/to/your/react-project
```

### Advanced Options

```bash
npm run convert -- \
  --repo https://github.com/username/project \
  --output ./my-output/template.json \
  --title "My Custom Template" \
  --verbose
```

### CLI Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--repo <url>` | `-r` | GitHub repository URL | - |
| `--local <path>` | `-l` | Local directory path | - |
| `--output <path>` | `-o` | Output file path | `./output/elementor-template.json` |
| `--title <title>` | `-t` | Template title | `Converted Template` |
| `--verbose` | `-v` | Verbose output | `false` |

### Using the Built CLI

After building, you can also run directly:

```bash
node dist/index.js convert --repo https://github.com/username/project
```

## 🗂️ Project Structure

```
konverterV0Elementor/
├── src/
│   ├── index.ts                    # CLI entry point
│   ├── types/
│   │   ├── elementor.ts            # Elementor type definitions
│   │   └── internal.ts             # Internal type definitions
│   ├── github/
│   │   ├── fetchRepo.ts            # GitHub repository fetcher
│   │   └── __tests__/
│   │       └── fetchRepo.test.ts   # Tests
│   └── parser/
│       ├── tsxParser.ts            # TSX/JSX parser
│       ├── styleMapper.ts          # Style conversion
│       ├── elementorMapper.ts      # Elementor JSON mapper
│       └── __tests__/
│           ├── elementorMapper.test.ts
│           └── styleMapper.test.ts
├── output/                         # Generated templates (created automatically)
├── downloaded-repos/               # Downloaded repositories (created automatically)
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🔄 Conversion Process

The conversion happens in several stages:

### 1. Repository Fetching
- Downloads GitHub repository (if URL provided)
- Validates repository structure
- Finds all TypeScript/React files

### 2. TSX Parsing
- Analyzes `.tsx` and `.ts` files using Babel parser
- Generates Abstract Syntax Tree (AST)
- Extracts component hierarchy and props
- Identifies JSX elements and their attributes

### 3. Style Mapping
- Converts Tailwind CSS classes to CSS values
- Maps inline styles to Elementor settings
- Handles spacing, colors, typography, borders, etc.

### 4. Elementor Conversion
- Maps React components to Elementor widgets
- Creates section/column structure
- Generates valid Elementor JSON format
- Validates output structure

## 🎨 Component Mapping

| React Component | Elementor Widget | Notes |
|----------------|------------------|-------|
| `<h1>` - `<h6>` | `heading` | Text mapped to settings.title |
| `<p>`, `<span>` | `text-editor` | Content mapped to settings.editor |
| `<img>` | `image` | src → settings.image.url |
| `<button>` | `button` | Text and link fields |
| `<a>` | `button` | Converted to button widget |
| `<section>`, `<article>` | `section` | Top-level layout section |
| `<div>` | `column` | Groups of widgets |
| `<form>` | `form` | Maps fields to form_fields |
| `<input>` | `form field` | Type-aware field mapping |
| `<video>` | `video` | Video widget |

## 🎨 Style Support

### Tailwind CSS Classes

The tool supports common Tailwind classes:

- **Spacing**: `p-4`, `px-6`, `py-4`, `m-8`, `mx-auto`, etc.
- **Colors**: `text-blue-500`, `bg-gray-100`, etc.
- **Typography**: `text-xl`, `font-bold`, `text-center`, etc.
- **Layout**: `flex`, `flex-col`, `justify-between`, `items-center`, `gap-4`, etc.
- **Sizing**: `w-full`, `h-64`, `max-w-lg`, etc.
- **Borders**: `rounded`, `rounded-lg`, `rounded-full`, etc.

### Inline Styles

Supports standard CSS properties:
- `padding`, `margin`
- `color`, `backgroundColor`
- `fontSize`, `fontWeight`, `fontFamily`
- `textAlign`, `lineHeight`
- `border`, `borderRadius`
- `width`, `height`, `maxWidth`

## 📝 Example

### Input: React Component (TSX)

```tsx
export default function Component() {
  return (
    <section className="flex flex-col items-center p-8 bg-white">
      <h1 className="text-4xl font-bold text-gray-900">
        Welcome to Our Site
      </h1>
      <p className="text-lg text-gray-600 mt-4">
        Your React design, now in Elementor!
      </p>
      <button className="bg-blue-500 text-white px-6 py-3 rounded-lg mt-6">
        Get Started
      </button>
    </section>
  );
}
```

### Output: Elementor JSON

```json
{
  "version": "0.4",
  "title": "Converted Template",
  "type": "page",
  "content": [
    {
      "id": "elem_1234567890_0",
      "elType": "section",
      "settings": {
        "layout": "boxed",
        "padding": {
          "top": "2rem",
          "right": "2rem",
          "bottom": "2rem",
          "left": "2rem",
          "unit": "px",
          "isLinked": true
        },
        "background_background": "classic",
        "background_color": "#ffffff"
      },
      "elements": [
        {
          "id": "elem_1234567890_1",
          "elType": "column",
          "settings": {},
          "elements": [
            {
              "id": "elem_1234567890_2",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Welcome to Our Site",
                "typography_typography": "custom",
                "typography_font_size": {
                  "size": "2.25rem",
                  "unit": "px"
                },
                "typography_font_weight": "700",
                "text_color": "#111827",
                "tag": "h1"
              }
            },
            {
              "id": "elem_1234567890_3",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "Your React design, now in Elementor!",
                "typography_typography": "custom",
                "typography_font_size": {
                  "size": "1.125rem",
                  "unit": "px"
                },
                "text_color": "#4b5563"
              }
            },
            {
              "id": "elem_1234567890_4",
              "elType": "widget",
              "widgetType": "button",
              "settings": {
                "text": "Get Started",
                "link": {
                  "url": "#",
                  "is_external": false,
                  "nofollow": false
                },
                "background_background": "classic",
                "background_color": "#3b82f6",
                "text_color": "#ffffff",
                "padding": {
                  "top": "0.75rem",
                  "right": "1.5rem",
                  "bottom": "0.75rem",
                  "left": "1.5rem",
                  "unit": "px",
                  "isLinked": false
                },
                "border_radius": {
                  "top": "2rem",
                  "right": "2rem",
                  "bottom": "2rem",
                  "left": "2rem",
                  "unit": "px",
                  "isLinked": true
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## 🧪 Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 🔧 Development

### Development Mode

```bash
npm run dev -- --local ./examples/sample-project
```

### Build

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## 📦 Importing to WordPress

1. Run the converter to generate `elementor-template.json`
2. Log in to your WordPress admin panel
3. Navigate to **Elementor → Templates**
4. Click **Import Template**
5. Upload the generated JSON file
6. The template is now available in your Elementor template library

## ⚠️ Known Limitations

- Complex state management and hooks are not converted
- Dynamic content and API calls become static
- Custom components need to be manually mapped
- Some advanced Tailwind utilities may not be supported
- Event handlers are not preserved (converted to static content)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with TypeScript
- Powered by Babel for AST parsing
- Elementor for WordPress page building
- V0.dev for React component generation

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ for the WordPress and React communities**
