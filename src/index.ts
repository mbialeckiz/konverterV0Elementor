#!/usr/bin/env node

/**
 * React to Elementor Converter CLI
 * Main entry point for the conversion tool
 */

import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { fetchAndPrepareRepo } from './github/fetchRepo';
import { parseDirectory } from './parser/tsxParser';
import { convertToElementor, validateElementorTemplate } from './parser/elementorMapper';
import { ConverterOptions, ConversionResult } from './types/internal';

const program = new Command();

/**
 * Main conversion function
 */
async function convert(options: ConverterOptions): Promise<ConversionResult> {
  const startTime = Date.now();
  const result: ConversionResult = {
    success: false,
    warnings: [],
    errors: [],
    stats: {
      filesProcessed: 0,
      componentsFound: 0,
      widgetsMapped: 0,
      elementsUnmapped: 0,
      duration: 0,
    },
  };

  try {
    // Step 1: Fetch repository if URL provided
    let workingDir = options.localPath || '';

    if (options.repoUrl) {
      console.log(chalk.blue('📦 Fetching repository...'));
      const spinner = ora('Downloading repository').start();

      try {
        workingDir = await fetchAndPrepareRepo(options.repoUrl);
        spinner.succeed('Repository downloaded');
      } catch (error) {
        spinner.fail('Failed to download repository');
        throw error;
      }
    }

    if (!workingDir) {
      throw new Error('Either --repo or --local must be specified');
    }

    if (!(await fs.pathExists(workingDir))) {
      throw new Error(`Directory not found: ${workingDir}`);
    }

    // Step 2: Parse TSX files
    console.log(chalk.blue('\n🔍 Parsing React components...'));
    const parseSpinner = ora('Analyzing TypeScript files').start();

    const { components, context } = await parseDirectory(workingDir);

    result.stats.filesProcessed = context.warnings.length;
    result.stats.componentsFound = components.length;
    result.warnings.push(...context.warnings);

    if (components.length === 0) {
      parseSpinner.fail('No components found');
      throw new Error('No React components found to convert');
    }

    parseSpinner.succeed(`Found ${components.length} components`);

    // Step 3: Convert to Elementor
    console.log(chalk.blue('\n🔄 Converting to Elementor format...'));
    const convertSpinner = ora('Mapping components to Elementor widgets').start();

    const elementorTemplate = convertToElementor(
      components,
      options.templateTitle || 'Converted from React'
    );

    // Validate template
    const validation = validateElementorTemplate(elementorTemplate);

    if (!validation.valid) {
      convertSpinner.warn('Template validation warnings');
      result.warnings.push(...validation.errors);
      if (options.verbose) {
        validation.errors.forEach((err) => console.log(chalk.yellow(`  ⚠ ${err}`)));
      }
    } else {
      convertSpinner.succeed('Conversion completed');
    }

    // Step 4: Write output
    console.log(chalk.blue('\n💾 Writing output file...'));
    const outputPath = path.resolve(options.outputPath);
    await fs.ensureDir(path.dirname(outputPath));

    const jsonContent = JSON.stringify(elementorTemplate, null, 2);
    await fs.writeFile(outputPath, jsonContent, 'utf-8');

    result.success = true;
    result.outputPath = outputPath;
    result.stats.duration = Date.now() - startTime;

    // Display summary
    console.log(chalk.green('\n✅ Conversion successful!'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.white(`Output: ${chalk.cyan(outputPath)}`));
    console.log(chalk.white(`Components: ${chalk.cyan(components.length)}`));
    console.log(chalk.white(`Sections: ${chalk.cyan(elementorTemplate.content.length)}`));
    console.log(
      chalk.white(
        `Duration: ${chalk.cyan((result.stats.duration / 1000).toFixed(2))}s`
      )
    );

    if (result.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠ ${result.warnings.length} warnings`));
      if (options.verbose) {
        result.warnings.forEach((warning) => {
          console.log(chalk.gray(`  • ${warning}`));
        });
      }
    }

    console.log(chalk.gray('─'.repeat(50)));
    console.log(
      chalk.white(
        '\n📝 Import this file in WordPress → Elementor → Templates → Import Template'
      )
    );

    return result;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
    result.stats.duration = Date.now() - startTime;

    console.log(chalk.red('\n❌ Conversion failed'));
    console.log(chalk.red(error instanceof Error ? error.message : String(error)));

    return result;
  }
}

/**
 * CLI Program setup
 */
program
  .name('react-to-elementor')
  .description('Convert React/TypeScript projects to Elementor JSON templates')
  .version('1.0.0');

program
  .command('convert')
  .description('Convert a React project to Elementor template')
  .option('-r, --repo <url>', 'GitHub repository URL')
  .option('-l, --local <path>', 'Local directory path')
  .option('-o, --output <path>', 'Output file path', './output/elementor-template.json')
  .option('-t, --title <title>', 'Template title', 'Converted Template')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    const converterOptions: ConverterOptions = {
      repoUrl: options.repo,
      localPath: options.local,
      outputPath: options.output,
      templateTitle: options.title,
      verbose: options.verbose,
    };

    await convert(converterOptions);
  });

// Default command (for backwards compatibility with npm run convert)
program
  .option('-r, --repo <url>', 'GitHub repository URL')
  .option('-l, --local <path>', 'Local directory path')
  .option('-o, --output <path>', 'Output file path', './output/elementor-template.json')
  .option('-t, --title <title>', 'Template title', 'Converted Template')
  .option('-v, --verbose', 'Verbose output', false)
  .action(async (options) => {
    // Only run if no subcommand was specified
    if (process.argv.length > 2 && !process.argv[2].startsWith('-')) {
      return;
    }

    const converterOptions: ConverterOptions = {
      repoUrl: options.repo,
      localPath: options.local,
      outputPath: options.output,
      templateTitle: options.title,
      verbose: options.verbose,
    };

    await convert(converterOptions);
  });

/**
 * Display help if no arguments provided
 */
if (process.argv.length === 2) {
  program.help();
}

program.parse(process.argv);
