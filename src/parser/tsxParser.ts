/**
 * TSX Parser - Analyzes React/TypeScript components using AST
 * Converts JSX elements into intermediate representation
 */

import * as parser from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IntermediateComponent, ParsingContext, StyleAttributes } from '../types/internal';

/**
 * Parse a TypeScript/TSX file and extract component structure
 */
export async function parseTsxFile(
  filePath: string,
  context: ParsingContext
): Promise<IntermediateComponent[]> {
  const code = await fs.readFile(filePath, 'utf-8');
  context.currentFile = filePath;

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    const components: IntermediateComponent[] = [];

    traverse(ast, {
      // Look for function components or arrow function components
      FunctionDeclaration(path) {
        const component = extractComponentFromFunction(path, context);
        if (component) {
          components.push(component);
        }
      },
      VariableDeclarator(path) {
        if (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init)) {
          const component = extractComponentFromVariable(path, context);
          if (component) {
            components.push(component);
          }
        }
      },
    });

    return components;
  } catch (error) {
    context.warnings.push(`Failed to parse ${filePath}: ${error}`);
    return [];
  }
}

/**
 * Extract component from a function declaration
 */
function extractComponentFromFunction(
  path: NodePath<t.FunctionDeclaration>,
  context: ParsingContext
): IntermediateComponent | null {
  const functionBody = path.node.body;

  // Find return statement
  let jsxElement: t.JSXElement | t.JSXFragment | null = null;

  traverse(
    functionBody,
    {
      ReturnStatement(returnPath) {
        const argument = returnPath.node.argument;
        if (t.isJSXElement(argument) || t.isJSXFragment(argument)) {
          jsxElement = argument;
          returnPath.stop();
        }
      },
    },
    path.scope
  );

  if (jsxElement) {
    return parseJSXElement(jsxElement, context);
  }

  return null;
}

/**
 * Extract component from a variable declarator
 */
function extractComponentFromVariable(
  path: NodePath<t.VariableDeclarator>,
  context: ParsingContext
): IntermediateComponent | null {
  const init = path.node.init;

  if (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init)) {
    const body = init.body;

    // Handle implicit return: const Component = () => <div>...</div>
    if (t.isJSXElement(body) || t.isJSXFragment(body)) {
      return parseJSXElement(body, context);
    }

    // Handle explicit return
    if (t.isBlockStatement(body)) {
      let jsxElement: t.JSXElement | t.JSXFragment | null = null;

      traverse(
        body,
        {
          ReturnStatement(returnPath) {
            const argument = returnPath.node.argument;
            if (t.isJSXElement(argument) || t.isJSXFragment(argument)) {
              jsxElement = argument;
              returnPath.stop();
            }
          },
        },
        path.scope
      );

      if (jsxElement) {
        return parseJSXElement(jsxElement, context);
      }
    }
  }

  return null;
}

/**
 * Parse a JSX element into intermediate representation
 */
export function parseJSXElement(
  element: t.JSXElement | t.JSXFragment | t.JSXText | any,
  context: ParsingContext
): IntermediateComponent | null {
  // Handle JSX Fragment
  if (t.isJSXFragment(element)) {
    return {
      type: 'div',
      children: element.children
        .map((child) => parseJSXElement(child, context))
        .filter((c): c is IntermediateComponent => c !== null),
    };
  }

  // Handle JSX Text
  if (t.isJSXText(element)) {
    const text = element.value.trim();
    if (text) {
      return {
        type: 'text',
        content: text,
      };
    }
    return null;
  }

  // Handle JSX Expression
  if (t.isJSXExpressionContainer(element)) {
    const expression = element.expression;
    if (t.isStringLiteral(expression)) {
      return {
        type: 'text',
        content: expression.value,
      };
    }
    // For other expressions, create a placeholder
    return {
      type: 'text',
      content: '{expression}',
    };
  }

  // Handle JSX Element
  if (!t.isJSXElement(element)) {
    return null;
  }

  const openingElement = element.openingElement;
  const elementName = getJSXElementName(openingElement.name);

  // Extract attributes
  const attributes: Record<string, any> = {};
  const styles: StyleAttributes = {};

  openingElement.attributes.forEach((attr) => {
    if (t.isJSXAttribute(attr)) {
      const name = t.isJSXIdentifier(attr.name) ? attr.name.name : '';
      const value = getAttributeValue(attr.value);

      if (name === 'className' || name === 'class') {
        attributes.className = value;
      } else if (name === 'style' && typeof value === 'object') {
        Object.assign(styles, value);
      } else {
        attributes[name] = value;
      }
    }
  });

  // Parse children
  const children: IntermediateComponent[] = element.children
    .map((child) => parseJSXElement(child, context))
    .filter((c): c is IntermediateComponent => c !== null);

  // Determine component type
  const type = mapElementType(elementName, attributes);

  // Extract text content for heading, button, etc.
  let content: string | undefined;
  if (['heading', 'button', 'text'].includes(type) && children.length > 0) {
    content = extractTextContent(children);
  }

  return {
    type,
    content,
    attributes,
    styles: Object.keys(styles).length > 0 ? styles : undefined,
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * Get JSX element name as string
 */
function getJSXElementName(name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName): string {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  }
  if (t.isJSXMemberExpression(name)) {
    return `${getJSXElementName(name.object as any)}.${name.property.name}`;
  }
  if (t.isJSXNamespacedName(name)) {
    return `${name.namespace.name}:${name.name.name}`;
  }
  return '';
}

/**
 * Get attribute value from JSX attribute
 */
function getAttributeValue(value: any): any {
  if (!value) return true;

  if (t.isStringLiteral(value)) {
    return value.value;
  }

  if (t.isJSXExpressionContainer(value)) {
    const expr = value.expression;

    if (t.isStringLiteral(expr)) {
      return expr.value;
    }
    if (t.isNumericLiteral(expr)) {
      return expr.value;
    }
    if (t.isBooleanLiteral(expr)) {
      return expr.value;
    }
    if (t.isObjectExpression(expr)) {
      const obj: Record<string, any> = {};
      expr.properties.forEach((prop) => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          const key = prop.key.name;
          if (t.isStringLiteral(prop.value)) {
            obj[key] = prop.value.value;
          } else if (t.isNumericLiteral(prop.value)) {
            obj[key] = prop.value.value;
          }
        }
      });
      return obj;
    }

    return '{expression}';
  }

  return null;
}

/**
 * Map HTML element names to intermediate component types
 */
function mapElementType(elementName: string, attributes: Record<string, any>): any {
  const name = elementName.toLowerCase();

  // Direct mappings
  const mappings: Record<string, any> = {
    h1: 'heading',
    h2: 'heading',
    h3: 'heading',
    h4: 'heading',
    h5: 'heading',
    h6: 'heading',
    p: 'text',
    span: 'text',
    img: 'image',
    button: 'button',
    a: 'link',
    ul: 'list',
    ol: 'list',
    li: 'listItem',
    section: 'section',
    article: 'section',
    div: 'container',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    header: 'section',
    footer: 'section',
    main: 'container',
    nav: 'container',
    aside: 'container',
    video: 'video',
    audio: 'audio',
  };

  return mappings[name] || 'div';
}

/**
 * Extract text content from children
 */
function extractTextContent(children: IntermediateComponent[]): string {
  return children
    .map((child) => {
      if (child.content) return child.content;
      if (child.children) return extractTextContent(child.children);
      return '';
    })
    .join(' ')
    .trim();
}

/**
 * Find all TSX/TS files in a directory
 */
export async function findTsxFiles(directory: string): Promise<string[]> {
  const glob = require('glob').glob;
  const files = await glob('**/*.{tsx,ts,jsx,js}', {
    cwd: directory,
    ignore: ['node_modules/**', 'dist/**', 'build/**', '**/*.test.*', '**/*.spec.*'],
    absolute: true,
  });

  return files;
}

/**
 * Parse all TSX files in a directory
 */
export async function parseDirectory(directory: string): Promise<{
  components: IntermediateComponent[];
  context: ParsingContext;
}> {
  const context: ParsingContext = {
    currentFile: '',
    depth: 0,
    warnings: [],
    mappedWidgets: 0,
    unmappedElements: [],
  };

  const files = await findTsxFiles(directory);
  console.log(`Found ${files.length} files to parse`);

  const allComponents: IntermediateComponent[] = [];

  for (const file of files) {
    console.log(`Parsing: ${path.relative(directory, file)}`);
    const components = await parseTsxFile(file, context);
    allComponents.push(...components);
  }

  console.log(`Parsed ${allComponents.length} components`);

  return {
    components: allComponents,
    context,
  };
}
