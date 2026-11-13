import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const source = resolve(process.argv[2]);
const { extractPackageFile } = await import(pathToFileURL(resolve(source, 'lib/modules/manager/index.ts')));
const manifest = await readFile(new URL('./package.json', import.meta.url), 'utf8');
const lock = await readFile(new URL('./bun.lock', import.meta.url), 'utf8');
const result = await extractPackageFile('bun', manifest, 'package.json', {
  lockFiles: ['bun.lock'], fileContents: { 'bun.lock': lock },
});
if (process.argv.includes('--expect-missing')) {
  assert.equal(result, null);
  console.log('BEFORE: Bun single-file re-extraction returns null (the branch worker emits the Mend warning).');
} else {
  assert.equal(result?.deps.find((dep) => dep.depName === 'prettier')?.lockedVersion, '3.0.0');
  console.log('AFTER: Bun re-extraction returns the resolved lockfile version 3.0.0 for manifest range ^3.0.0.');
}
