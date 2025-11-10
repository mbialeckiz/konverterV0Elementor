/**
 * GitHub Repository Fetcher
 * Downloads and extracts GitHub repositories for processing
 */

import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Extract owner and repo name from GitHub URL
 * Supports various GitHub URL formats
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Match patterns like:
  // https://github.com/owner/repo
  // https://github.com/owner/repo.git
  // git@github.com:owner/repo.git
  const patterns = [
    /github\.com[\/:]([^\/]+)\/([^\/\.]+)(\.git)?$/,
    /github\.com\/([^\/]+)\/([^\/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', ''),
      };
    }
  }

  return null;
}

/**
 * Download repository as a ZIP archive from GitHub
 */
export async function downloadRepository(
  repoUrl: string,
  outputDir: string
): Promise<string> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error(`Invalid GitHub URL: ${repoUrl}`);
  }

  const { owner, repo } = parsed;

  // Create output directory
  await fs.ensureDir(outputDir);

  const repoDir = path.join(outputDir, repo);

  // Check if git is available
  try {
    await execAsync('git --version');

    // Clone using git
    console.log(`Cloning repository: ${owner}/${repo}...`);

    // Remove existing directory if it exists
    if (await fs.pathExists(repoDir)) {
      await fs.remove(repoDir);
    }

    await execAsync(`git clone --depth 1 https://github.com/${owner}/${repo}.git "${repoDir}"`);

    console.log(`Repository cloned to: ${repoDir}`);
    return repoDir;

  } catch (error) {
    // Fallback to downloading as ZIP if git is not available
    console.log('Git not available, downloading as ZIP...');
    return await downloadAsZip(owner, repo, outputDir);
  }
}

/**
 * Download repository as ZIP (fallback method)
 */
async function downloadAsZip(
  owner: string,
  repo: string,
  outputDir: string
): Promise<string> {
  const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
  const zipPath = path.join(outputDir, `${repo}.zip`);
  const extractPath = path.join(outputDir, repo);

  try {
    // Download ZIP file
    console.log(`Downloading from: ${zipUrl}`);
    const response = await axios.get(zipUrl, {
      responseType: 'arraybuffer',
    });

    await fs.writeFile(zipPath, response.data);
    console.log(`Downloaded to: ${zipPath}`);

    // Extract ZIP (requires unzip command or manual extraction)
    await fs.ensureDir(extractPath);

    try {
      await execAsync(`unzip -q "${zipPath}" -d "${outputDir}"`);

      // Move contents from extracted folder
      const extractedFolder = path.join(outputDir, `${repo}-main`);
      if (await fs.pathExists(extractedFolder)) {
        await fs.move(extractedFolder, extractPath, { overwrite: true });
      }

      // Clean up ZIP file
      await fs.remove(zipPath);

    } catch (error) {
      console.warn('Could not extract ZIP automatically. Please extract manually.');
      throw new Error('ZIP extraction failed. Please install unzip or use git clone.');
    }

    return extractPath;

  } catch (error) {
    // Try master branch if main doesn't exist
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const masterZipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`;
      console.log('Trying master branch...');

      const response = await axios.get(masterZipUrl, {
        responseType: 'arraybuffer',
      });

      await fs.writeFile(zipPath, response.data);
      await execAsync(`unzip -q "${zipPath}" -d "${outputDir}"`);

      const extractedFolder = path.join(outputDir, `${repo}-master`);
      if (await fs.pathExists(extractedFolder)) {
        await fs.move(extractedFolder, extractPath, { overwrite: true });
      }

      await fs.remove(zipPath);
      return extractPath;
    }

    throw error;
  }
}

/**
 * Validate that the downloaded repository contains TypeScript/React files
 */
export async function validateRepository(repoPath: string): Promise<boolean> {
  const requiredIndicators = [
    'package.json',
    'tsconfig.json',
  ];

  const optionalIndicators = [
    'src',
    'components',
    'app',
  ];

  // Check for required files
  for (const indicator of requiredIndicators) {
    const indicatorPath = path.join(repoPath, indicator);
    if (!(await fs.pathExists(indicatorPath))) {
      console.warn(`Warning: ${indicator} not found in repository`);
    }
  }

  // Check for optional directories
  let hasSourceFiles = false;
  for (const indicator of optionalIndicators) {
    const indicatorPath = path.join(repoPath, indicator);
    if (await fs.pathExists(indicatorPath)) {
      hasSourceFiles = true;
      break;
    }
  }

  if (!hasSourceFiles) {
    console.warn('Warning: No common source directories found (src, components, app)');
  }

  // Look for .tsx or .ts files
  const glob = require('glob').glob;
  const tsxFiles = await glob('**/*.{tsx,ts,jsx,js}', {
    cwd: repoPath,
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
  });

  if (tsxFiles.length === 0) {
    throw new Error('No TypeScript/React files found in repository');
  }

  console.log(`Found ${tsxFiles.length} TypeScript/React files`);
  return true;
}

/**
 * Main function to fetch and prepare a GitHub repository
 */
export async function fetchAndPrepareRepo(
  repoUrl: string,
  workDir: string = './downloaded-repos'
): Promise<string> {
  console.log(`Fetching repository: ${repoUrl}`);

  const repoPath = await downloadRepository(repoUrl, workDir);
  await validateRepository(repoPath);

  console.log(`Repository ready at: ${repoPath}`);
  return repoPath;
}
