// Copyright (c) 2026 Capsize LLC. All rights reserved.
// SPDX-License-Identifier: LicenseRef-Capsize-Proprietary
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const read = (name) => readFile(path.join(root, name), 'utf8');

async function markdownFiles(directory) {
  const result = [];
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    if (['.git', 'node_modules', 'work', '.venv'].includes(entry.name)) continue;
    const name = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await markdownFiles(name));
    else if (entry.isFile() && entry.name.endsWith('.md')) result.push(name);
  }
  return result.sort();
}

function headings(text) {
  const result = new Set();
  const duplicates = new Map();
  for (const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const base = match[1].toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
    const count = duplicates.get(base) ?? 0;
    result.add(count ? `${base}-${count}` : base);
    duplicates.set(base, count + 1);
  }
  return result;
}

const manifest = JSON.parse(await read('package.json'));
assert.equal(manifest.private, true, 'Package must remain private');
assert.equal(manifest.license, 'LicenseRef-Capsize-Proprietary');
assert.equal(manifest.repository.url, 'git@github.com:Capsize-Games/prooflink.git');
assert.equal(Object.keys(manifest.dependencies ?? {}).length, 0, 'Bootstrap has no runtime dependencies');

assert.equal(digest(await readFile(path.join(root, 'LICENSE'))),
  '9636b226965bf315997561717ef638a5ddf8b7ae15636f4d11dfc6e66dd52611',
  'License must match the approved HQ proprietary notice');
assert.equal(digest(await readFile(path.join(root, 'docs/source/original-brief.md'))),
  '97ab3c8b52c7eb30e0e99edb7c57e8b0231585a173c564c4f216e0fb0c23c5e0',
  'Preserve the original user brief verbatim');

const files = await markdownFiles('');
const texts = new Map(await Promise.all(files.map(async (file) => [file, await read(file)])));
let links = 0;
let jsonExamples = 0;
let mermaidDiagrams = 0;

for (const [file, text] of texts) {
  let fence = null;
  let language = '';
  let body = [];
  for (const line of text.split('\n')) {
    const marker = line.match(/^(`{3,}|~{3,})(.*)$/);
    if (marker && fence === null) {
      fence = marker[1];
      language = marker[2].trim();
      body = [];
    } else if (marker && marker[1][0] === fence?.[0] && marker[1].length >= fence.length && !marker[2].trim()) {
      if (language === 'json') {
        try { JSON.parse(body.join('\n')); }
        catch (error) { throw new Error(`${file}: invalid JSON example: ${error.message}`); }
        jsonExamples += 1;
      }
      if (language === 'mermaid') {
        assert.ok(body.some((item) => item.trim()), `${file}: empty Mermaid diagram`);
        mermaidDiagrams += 1;
      }
      fence = null;
    } else if (fence !== null) body.push(line);
  }
  assert.equal(fence, null, `${file}: unclosed code fence`);

  for (const match of text.matchAll(/\[[^\]]+\]\(([^\s)]+)\)/g)) {
    const href = match[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
      assert.ok(href.startsWith('https://'), `${file}: unexpected external link scheme ${href}`);
      continue;
    }
    const [rawName, rawAnchor] = href.split('#');
    const target = path.resolve(root, path.dirname(file), decodeURIComponent(rawName || path.basename(file)));
    assert.ok(target.startsWith(root), `${file}: link outside repository: ${href}`);
    await stat(target).catch(() => { throw new Error(`${file}: missing link target ${href}`); });
    if (rawAnchor && target.endsWith('.md')) {
      const targetText = await readFile(target, 'utf8');
      assert.ok(headings(targetText).has(decodeURIComponent(rawAnchor)), `${file}: missing anchor ${href}`);
    }
    links += 1;
  }
}

const architecture = texts.get('docs/ARCHITECTURE.md');
for (const letter of 'ABCDEFGHIJ') {
  assert.match(architecture, new RegExp(`^## ${letter}\\. `, 'm'), `Architecture section ${letter} missing`);
}
assert.equal(mermaidDiagrams, 6, 'Keep all six requested architecture diagrams');
const tasks = texts.get('docs/ROADMAP.md').split('## First ten engineering tasks\n')[1];
assert.ok(tasks, 'First ten engineering tasks missing');
assert.deepEqual([...tasks.matchAll(/^(\d+)\. /gm)].map((match) => Number(match[1])),
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
assert.match(texts.get('README.md'), /no signing service, verifier, website, or deployed infrastructure/);

console.log(`PASS: ${files.length} Markdown files, ${links} local links, ${jsonExamples} JSON examples, ${mermaidDiagrams} diagram blocks.`);
console.log('PASS: required architecture sections, first ten tasks, private package metadata, exact license and source brief.');
console.log('Limits: no protocol implementation, cryptographic conformance, Mermaid rendering, external-link availability, or deployment tests.');
