<!--
Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
SPDX-License-Identifier: Apache-2.0
-->

# Repository instructions for coding agents

Fabio Sobral is the sole current maintainer.

Before editing, read this file and `.agent/PLANS.md`, inspect `git status
--short --branch`, and locate any applicable nested instructions. Keep an
active ExecPlan current for long or multi-step work.

The TypeScript extension is in `src/`; historical project templates are in
`resources/`. Use `npm run compile` to type-check and compile, `npm test` for
the VS Code integration suite, `python3 tools/check-repository-governance.py`
for repository governance checks, and `python3 -m unittest
tests.test_repository_governance` for the validator tests. Use `npm run audit`
to verify the committed dependency graph. Prefer focused
checks first and keep verbose output in a log when useful.

Preserve historical TotalCross MIT notices and all third-party, generated, and
separately licensed notices. New first-party source uses the Amalgam
Apache-2.0 header unless a documented exception applies. Never publish the
obsolete former project contact address; report provenance or licensing
ambiguity instead of guessing.

For governance-only work, do not mix in broad formatting or implementation
refactoring. Keep commits logical, narrowly described, and buildable whenever
practical. Do not rewrite history, force-push, delete tags, or change release
artifacts without explicit authorization.
