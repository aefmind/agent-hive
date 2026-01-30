import { describe, expect, it } from 'bun:test';
import * as path from 'path';
import { isValidPromptFilePath } from './prompt-file.js';

describe('isValidPromptFilePath', () => {
  it('allows paths within workspace regardless of casing on windows', () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32' });
    try {
      const workspaceRoot = path.join('C:', 'Repo', 'Project');
      const filePath = path.join('c:', 'repo', 'project', '.hive', 'prompt.md');
      expect(isValidPromptFilePath(filePath, workspaceRoot)).toBe(true);
    } finally {
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    }
  });
});
