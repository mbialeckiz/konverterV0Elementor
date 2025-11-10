# Quick Setup Guide

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Quick Start

### Convert a local React project

```bash
npm run convert -- --local ./path/to/react-project
```

### Convert a GitHub repository

```bash
npm run convert -- --repo https://github.com/username/v0-project
```

### Try the example

```bash
npm run convert -- --local ./examples --output ./examples/output.json
```

## Project Structure

```
konverterV0Elementor/
├── src/
│   ├── index.ts                           # CLI entry point
│   ├── types/
│   │   ├── elementor.ts                   # Elementor JSON type definitions
│   │   └── internal.ts                    # Internal type definitions
│   ├── github/
│   │   ├── fetchRepo.ts                   # GitHub repository fetcher
│   │   └── __tests__/fetchRepo.test.ts
│   └── parser/
│       ├── tsxParser.ts                   # TSX/React parser (Babel AST)
│       ├── styleMapper.ts                 # CSS/Tailwind → Elementor styles
│       ├── elementorMapper.ts             # Intermediate → Elementor JSON
│       └── __tests__/
│           ├── elementorMapper.test.ts
│           └── styleMapper.test.ts
├── examples/
│   ├── sample-component.tsx               # Example React component
│   ├── expected-output.json               # Expected Elementor output
│   └── README.md
├── package.json
├── tsconfig.json
├── README.md
└── SETUP.md (this file)
```

## Development

### Run in development mode

```bash
npm run dev -- --local ./examples
```

### Run tests

```bash
npm test
```

### Lint code

```bash
npm run lint
```

### Format code

```bash
npm run format
```

## How It Works

### 1. Parse TSX Files
- Uses Babel parser to create AST from React/TypeScript files
- Extracts component structure, props, and JSX hierarchy
- Identifies HTML elements and their attributes

### 2. Style Mapping
- Converts Tailwind CSS classes to inline CSS values
- Maps CSS properties to Elementor settings
- Handles spacing, colors, typography, borders

### 3. Elementor Conversion
- Maps React components to Elementor widgets
- Creates section/column structure
- Generates valid Elementor JSON format

### 4. Output
- Saves formatted JSON file
- Validates structure
- Reports warnings and errors

## Supported Components

| React | Elementor |
|-------|-----------|
| h1-h6 | heading |
| p, span | text-editor |
| img | image |
| button | button |
| section | section |
| div | column/container |
| form | form |
| input | form field |
| video | video |

## Supported Styles

### Tailwind Classes
- Spacing: p-*, m-*, px-*, py-*, etc.
- Colors: text-*, bg-*
- Typography: text-xl, font-bold, etc.
- Layout: flex, flex-col, gap-*, etc.
- Sizing: w-*, h-*, max-w-*
- Borders: rounded-*

### CSS Properties
- padding, margin
- color, backgroundColor
- fontSize, fontWeight
- textAlign, lineHeight
- border, borderRadius
- width, height

## Import to WordPress

1. Run converter to generate JSON file
2. WordPress Admin → Elementor → Templates
3. Import Template → Upload JSON file
4. Template is now in your library

## Troubleshooting

### "No TypeScript/React files found"
- Make sure you're pointing to the correct directory
- Check that files have .tsx or .ts extensions
- Verify files are not in node_modules or dist directories

### "Invalid GitHub URL"
- URL must be in format: https://github.com/owner/repo
- Make sure repository is public
- Check your internet connection

### "Template validation warnings"
- These are usually safe to ignore
- They indicate elements that couldn't be fully mapped
- Check the generated JSON manually if needed

## Next Steps

1. Build the project: `npm run build`
2. Try the example: `npm run convert -- --local ./examples`
3. Convert your own React project
4. Import the JSON into WordPress/Elementor
5. Customize the template in Elementor

## Support

For issues and questions, please check:
- README.md for full documentation
- examples/ directory for working examples
- GitHub Issues for known problems

Happy converting! 🚀
