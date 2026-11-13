# Bun package-file re-extraction reproduction

Related discussion: https://github.com/renovatebot/renovate/discussions/45284

## Current behavior

When an artifact update has `pendingVersions` from `minimumReleaseAge`, the branch worker calls the generic single-file extractor. Bun only exports the bulk extractor, so this returns `null` and the worker emits `Could not re-extract the packageFile after updating it (package.json)`.

This example has one public dependency and a real Bun-generated text lockfile. The generous minimum release age keeps pending releases available for normal hosted runs; registry-dependent behavior changes with time.

## Deterministic reproduction

Use Node 24 and a Renovate source directory with its dependencies installed (`pnpm install`). This script uses the same manager dispatcher as the branch worker, without registry requests or credentials.

```sh
node reproduce.mjs /path/to/renovate --expect-missing
```

Unmodified Renovate main at `c9bc1d9e162a663044b2321cd97574a8e51ab4d7` returns null. To test the fix, run against the patched source without `--expect-missing`:

```sh
node reproduce.mjs /path/to/renovate
```

## Expected behavior

Bun re-extraction succeeds and returns `lockedVersion: "3.0.0"` from `bun.lock` for manifest range `^3.0.0`. The branch worker can then compare resolved versions with pending releases. The accompanying upstream regression tests check both allowed/pending versions and shared workspace lockfiles.

## Disclosure

This minimal example and its script were prepared with substantive AI assistance from OpenAI Codex (GPT-6).
