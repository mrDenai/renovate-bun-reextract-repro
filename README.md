# Bun package-file re-extraction reproduction

Related discussion: https://github.com/renovatebot/renovate/discussions/45284

## Current behavior

When an artifact update has `pendingVersions` from `minimumReleaseAge`, the branch worker calls the generic single-file extractor. Bun only exports the bulk extractor, so this returns `null` and the worker emits `Could not re-extract the packageFile after updating it (package.json)`.

This example has one public dependency and a real Bun-generated text lockfile. The `bump` range strategy is required: Bun bulk extraction has no lockedVersion, and `replace` would treat the highest matching release as the current version, yielding no update. `bump` starts from the lowest matching version 3.0.0; the generous minimum release age leaves both an eligible update and newer pending releases. Registry-dependent behavior changes with time.

## Hosted reproduction

Run Renovate against this repository using its `renovate.json`. As of 2026-11-13, real lookup returns an eligible update to Prettier 3.6.2 with manifest range `^3.6.2`, while 3.10.1 remains pending. Bun can resolve that range to 3.10.1. Unpatched Renovate then reaches the missing single-file extractor and emits the warning. The initial version of this reproduction used `replace` and did not trigger a hosted update; that configuration was corrected after testing the actual lookup code.

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
