/**
 * Unit tests for GitHub Repository Fetcher
 */

import { parseGitHubUrl } from '../fetchRepo';

describe('GitHub Fetcher', () => {
  describe('parseGitHubUrl', () => {
    test('parses HTTPS URL', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    test('parses HTTPS URL with .git extension', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo.git');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    test('parses SSH URL', () => {
      const result = parseGitHubUrl('git@github.com:owner/repo.git');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    test('parses URL with trailing slash', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo/');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    test('handles invalid URL', () => {
      const result = parseGitHubUrl('not-a-valid-url');
      expect(result).toBeNull();
    });

    test('handles non-GitHub URL', () => {
      const result = parseGitHubUrl('https://gitlab.com/owner/repo');
      expect(result).toBeNull();
    });

    test('parses complex repository names', () => {
      const result = parseGitHubUrl('https://github.com/facebook/react');
      expect(result).toEqual({ owner: 'facebook', repo: 'react' });
    });

    test('parses repository names with hyphens', () => {
      const result = parseGitHubUrl('https://github.com/vercel/next.js');
      expect(result).toEqual({ owner: 'vercel', repo: 'next.js' });
    });
  });
});
