// Copyright (c) 2026 Capsize LLC. All rights reserved.
// SPDX-License-Identifier: LicenseRef-Capsize-Proprietary
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { appendFile, cp, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../', import.meta.url));
const excluded = new Set(['.git', 'node_modules', '.venv', 'work', 'dist', 'coverage']);

async function fixture(change) {
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'prooflink-docs-'));
  const repository = path.join(sandbox, 'repo');
  try {
    await cp(source, repository, {
      recursive: true,
      filter: (item) => !path.relative(source, item).split(path.sep).some((part) => excluded.has(part)),
    });
    await change(repository, sandbox);
    const result = spawnSync(process.execPath, ['scripts/check-docs.mjs'], {
      cwd: repository,
      encoding: 'utf8',
      timeout: 10_000,
      maxBuffer: 1024 * 1024,
    });
    assert.ifError(result.error);
    return result;
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
}

function passed(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function rejected(result, message) {
  assert.notEqual(result.status, 0, 'Expected checker failure');
  assert.match(result.stderr, message);
}

test('the repository passes unchanged', async () => {
  passed(await fixture(async () => {}));
});

test('fenced Markdown examples do not create live links', async () => {
  passed(await fixture((repo) => appendFile(path.join(repo, 'README.md'),
    '\n```markdown\n[Example](missing-example.md)\n```\n')));
});

test('inline code examples do not create live links', async () => {
  passed(await fixture((repo) => appendFile(path.join(repo, 'README.md'),
    '\n`[Example](missing-inline.md)` and ``[Other](missing-other.md)``\n')));
});

test('a heading inside a fenced block cannot satisfy an anchor', async () => {
  rejected(await fixture((repo) => appendFile(path.join(repo, 'README.md'),
    '\n```markdown\n## Imaginary heading\n```\n\n[Broken](#imaginary-heading)\n')),
  /missing anchor/);
});

test('a symlink cannot make an outside file a local link target', async () => {
  rejected(await fixture(async (repo, sandbox) => {
    await writeFile(path.join(sandbox, 'outside.md'), '# Outside\n');
    await symlink('../outside.md', path.join(repo, 'escape.md'));
    await appendFile(path.join(repo, 'README.md'), '\n[Escape](escape.md#outside)\n');
  }), /link resolves outside repository/);
});

test('a real missing local file is rejected', async () => {
  rejected(await fixture((repo) => appendFile(path.join(repo, 'README.md'),
    '\n[Missing](actual-missing.md)\n')), /missing link target/);
});

test('invalid fenced JSON is rejected', async () => {
  rejected(await fixture((repo) => appendFile(path.join(repo, 'README.md'),
    '\n```json\n{"broken":}\n```\n')), /invalid JSON example/);
});

test('extra diagrams outside the architecture do not remove its six required diagrams', async () => {
  passed(await fixture((repo) => writeFile(path.join(repo, 'docs', 'example.md'),
    '# Example\n\n```mermaid\nflowchart LR\n    A --> B\n```\n')));
});

test('the approved license is protected', async () => {
  rejected(await fixture((repo) => appendFile(path.join(repo, 'LICENSE'), '\nChanged\n')),
    /License must match/);
});

test('public repository visibility does not permit npm publishing', async () => {
  rejected(await fixture(async (repo) => {
    const filename = path.join(repo, 'package.json');
    const manifest = JSON.parse(await readFile(filename, 'utf8'));
    manifest.private = false;
    await writeFile(filename, JSON.stringify(manifest));
  }), /Package must remain private/);
});
