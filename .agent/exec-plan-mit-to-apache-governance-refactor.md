<!--
Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
SPDX-License-Identifier: Apache-2.0
-->

# Migrate project governance from MIT to Apache-2.0, correct authorship and maintenance attribution, then refactor in logical commits

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan must be maintained in accordance with the repository's `.agent/PLANS.md`. If that file does not yet exist, create it in the first governance commit using the current OpenAI Codex ExecPlan conventions, and use this document as the initial plan executed under those rules.

## Purpose / Big Picture

The project currently uses the MIT license and contains historical authorship, maintenance, copyright, and contact information that must be updated without erasing legitimate historical attribution.

The work has two deliberately separate phases:

1. create one governance commit that changes the project license prospectively from MIT to Apache License 2.0, corrects repository-level authorship and maintenance metadata, removes the obsolete former project contact address, adds agent instructions and planning conventions, introduces deterministic validators, and normalizes first-party source headers according to the ownership period of each file;
2. after the governance baseline is complete and validated, inspect the implementation and perform justified refactoring and reorganization, committing those changes in small, coherent, independently reviewable groups.

After the first commit:

- the repository license for new and modified project work is identified by `SPDX-License-Identifier: Apache-2.0`;
- the original project is credited to Italo Yeltsin (`@ItaloYeltsin`);
- Fabio Sobral (`@flsobral`) is identified as the sole current maintainer;
- previously credited people remain visible in a historical contributors section, without being presented as current maintainers;
- all occurrences of the obsolete former project contact address are removed from first-party project content and metadata where removal is legally and technically appropriate;
- source files attributable to the original 2020–2021 TotalCross period retain that historical ownership and MIT licensing information;
- source files attributable to the 2022–2026 Amalgam period use Amalgam copyright and Apache-2.0 licensing information;
- third-party, vendored, generated, imported, or separately licensed files retain their authoritative notices;
- repository documentation explains the license transition and the distinction between original creation, historical contribution, present maintenance, and copyright ownership;
- contributors and agents can run one concise validation command locally, and CI runs the same checks;
- `AGENTS.md` and `.agent/PLANS.md` define how coding agents must inspect, edit, validate, and commit changes in this repository.

The plan must not claim that code originally distributed under MIT retroactively became Apache-2.0. The repository-level transition is prospective from the governance commit onward. Historical MIT notices must remain accurate where they apply.

## Progress

- [x] (2026-07-15) Read `.agent/PLANS.md` and this ExecPlan; no pre-existing `AGENTS.md`, contributor guide, or nested instruction file was tracked.
- [x] (2026-07-15) Inspected local and remote Git history, `master`, tags, working tree, and commit conventions without rewriting history.
- [x] (2026-07-15) Inventoried licensing, attribution, contact, source, build, and CI files.
- [x] (2026-07-15) Searched the obsolete contact, attribution names, contributors, and license notices; the only current-content occurrence was in `README.md`, while historical Git metadata remains unchanged.
- [x] (2026-07-15) Classified all `src/` and first-party `resources/` source/templates as historical MIT work; `resources/maven-metadata.xml` as generated; documentation/configuration/assets as metadata or excluded; and new governance tooling as Amalgam Apache-2.0 work. No mixed-history production file was found.
- [x] (2026-07-15) Recorded historical contributors evidenced by Git or the previous README: Allan C, lucasgalvanini, Ricardo Braga, and @nmarquesin.
- [x] (2026-07-15) Applied the requested prospective Apache-2.0 transition only to current/new work; Git history contains no Amalgam-era source modification that would require a mixed header.
- [x] (2026-07-15) Defined and implemented canonical C-style, hash-style, XML, and shebang-preserving header validation.
- [x] (2026-07-15) Created `AGENTS.md` and adopted the existing untracked `.agent/PLANS.md` as the repository planning convention.
- [x] (2026-07-15) Updated `LICENSE`, `NOTICE`, `README.md`, `AUTHORS.md`, `CONTRIBUTING.md`, and `.github/CODEOWNERS`.
- [x] (2026-07-15) Implemented `tools/check-repository-governance.py` with deterministic Git-based path handling and concise sorted diagnostics.
- [x] (2026-07-15) Added 14 focused `unittest` cases, including headers, provenance exceptions, attribution, ordering, whitespace paths, shebangs, and XML declarations.
- [x] (2026-07-15) Added `.github/workflows/governance-validation.yml` invoking the documented validator and test commands.
- [x] (2026-07-15) Added historical MIT headers to 21 applicable `src/`, `resources/`, and shell files; generated Maven metadata remains untouched.
- [x] (2026-07-15) Reviewed the governance diff; it contains attribution, licensing, planning, validation, CI, and header changes only.
- [x] (2026-07-15) Created governance commit `ca549be` (`chore(governance): migrate project licensing to Apache-2.0`).
- [x] (2026-07-15) Ran governance validation and 14 focused tests from the governance baseline; compile failure was isolated to a resolved `@types/vscode` version incompatible with TypeScript 3.9.10, before project source compilation.
- [x] (2026-07-15) Inspected module sizes, package boundaries, build configuration, dependencies, source/test layout, public extension entry points, and obvious sensitive logging. The only safe, independently testable change within scope is deterministic type dependency resolution.
- [x] (2026-07-15) Recorded the build dependency refactoring group before changing it.
- [x] (2026-07-15) Implemented the build dependency refactoring by pinning `@types/vscode` to 1.40.0; `npm run compile`, governance validation, and 14 governance unit tests pass.
- [x] (2026-07-15) Ran focused validation for the build dependency refactoring; no source or public API behavior changed.
- [x] (2026-07-15) Ran the full supported `npm test` suite after recompilation; the deprecated `vscode-test` wrapper downloaded VS Code 1.129.0 but failed to launch it on macOS with unsupported Electron option errors.
- [x] (2026-07-15) Recorded a second build/test tooling refactoring group before changing it: replace the deprecated wrapper with its maintained `@vscode/test-electron` successor.
- [x] (2026-07-15) Implemented and validated the test tooling refactoring: `npm test` launches VS Code 1.129.0 and reports two passing extension tests after clearing the inherited Electron Node-mode marker.
- [x] (2026-07-15) Reviewed the final sequence: `ca549be` is governance-only; `b7072bd` isolates dependency compatibility; `d8dc0e6` isolates integration-test tooling.
- [x] (2026-07-15) Completed `Outcomes & Retrospective` and the evidence-based `Editorial Report` below.

## Surprises & Discoveries

Record repository-specific findings here as work proceeds.

Important examples include:

- a file includes contributions from both licensing periods and cannot be classified from its current header alone;
- Git history contradicts the year or owner written in a header;
- the MIT license text grants permissions that must remain available for historical releases;
- Apache relicensing authority is incomplete or unclear for some contributor-owned code;
- an email address occurs in a historical artifact, test fixture, patch, vendored file, or signed metadata where removing it would alter authoritative third-party or historical material;
- contributor names appear only in Git history and not in repository documentation;
- generated sources are checked in and require changes to their generator instead of direct edits;
- source files have mandatory first lines such as shebangs, XML declarations, encoding declarations, or generated markers;
- a refactor that appears cosmetic changes public API, binary compatibility, serialization, package names, resource paths, or platform behavior;
- tests are missing for code that should be reorganized, requiring characterization tests before structural changes.

Do not silently resolve legal, attribution, or historical ambiguity. Record the evidence, the chosen treatment, and any limitation.

- Observation: All version-controlled production source and first-party templates have a first or last substantive Git change dated 2019-2021; the only post-2021 commit changes `CHANGELOG.md`.
  Evidence: Per-file `git log --follow` inventory and `git log --all` show no source created or materially changed in the requested 2022-2026 Amalgam period.

- Observation: A clean dependency install resolves `@types/vscode` beyond the syntax understood by the pinned TypeScript 3.6.4 compiler, so `npm run compile` fails before compiling this repository's source.
  Evidence: `npm install --ignore-scripts --no-package-lock && npm run compile` reports syntax errors in `node_modules/@types/vscode/index.d.ts`; governance validation and its 14 unit tests pass.

- Observation: The deprecated `vscode-test` package cannot launch the latest downloaded VS Code on macOS; the process reports `bad option: --no-sandbox` and exits with code 9.
  Evidence: The second final `npm test` attempt reused VS Code 1.129.0 and failed from `src/test/runTest.ts` before the extension test suite could run.

- Observation: `@vscode/test-electron` 3.0.0 supports the active Node.js runtime but exposes declaration syntax incompatible with the project's TypeScript 3.9 compiler.
  Evidence: A clean install followed by compilation reports `Type 'Buffer' is not generic` in `@vscode/test-electron/out/util.d.ts`.

- Observation: The Electron launch errors are caused by the inherited `ELECTRON_RUN_AS_NODE=1` environment variable, not by the downloaded VS Code application.
  Evidence: The active extension-host environment contains that variable; Electron reports Node-style `bad option` errors for the VS Code launch arguments. Removing it before `runTests` lets Electron launch as the VS Code application.

## Decision Log

- Decision: Change the repository's current license from MIT to Apache License 2.0 prospectively from the governance commit onward.
  Rationale: The requested future project license is Apache-2.0, but code and releases previously distributed under MIT remain available under the permissions already granted by MIT.
  Date: 2026-07-15

- Decision: Use the exact SPDX identifier:

      SPDX-License-Identifier: Apache-2.0

  Rationale: `Apache-2.0` is the canonical SPDX identifier for Apache License 2.0.
  Date: 2026-07-15

- Decision: Attribute original project creation to Italo Yeltsin (`@ItaloYeltsin`).
  Rationale: Original creation must remain visible and must not be conflated with present maintenance or current copyright ownership.
  Date: 2026-07-15

- Decision: Identify Fabio Sobral (`@flsobral`) as the sole current maintainer.
  Rationale: Current repository responsibility should be unambiguous in the README, authorship documentation, CODEOWNERS, and agent instructions.
  Date: 2026-07-15

- Decision: Preserve all previously named people in a historical contributors list unless repository evidence shows that a name is erroneous or belongs to an unrelated third party.
  Rationale: Updating maintenance must not erase legitimate historical contribution.
  Date: 2026-07-15

- Decision: Remove the obsolete former project contact address from first-party repository content and metadata.
  Rationale: The email address is obsolete and must no longer be published as a project contact. Historical Git commit metadata must not be rewritten unless separately authorized.
  Date: 2026-07-15

- Decision: Do not rewrite Git history as part of this plan.
  Rationale: The requested changes can be represented truthfully in a new governance commit. Existing commit authors, signed commits, tags, and released history must remain intact.
  Date: 2026-07-15

- Decision: Use period-specific legal headers rather than replacing every historical notice with a single current notice.
  Rationale: Copyright ownership and licensing must reflect the period and provenance of the work.
  Date: 2026-07-15

- Decision: Use the following canonical historical classification when supported by repository evidence:

      Copyright (C) 2020-2021 TotalCross Global Mobile Platform Ltda.
      SPDX-License-Identifier: MIT

  Rationale: This preserves the requested ownership and MIT licensing for original-period files.
  Date: 2026-07-15

- Decision: Use the following canonical current-period classification when supported by repository evidence:

      Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
      SPDX-License-Identifier: Apache-2.0

  Rationale: This identifies Amalgam ownership and Apache-2.0 licensing for the requested later period.
  Date: 2026-07-15

- Decision: Mixed-history files require evidence-based treatment and may include more than one copyright line.
  Rationale: A file substantially originating in 2020–2021 and later modified in 2022–2026 may legitimately need both ownership statements. Do not erase the earlier owner merely because the current repository license changed.
  Date: 2026-07-15

- Decision: The first commit contains governance, licensing, attribution, validators, README, agent instructions, planning conventions, and all required header normalization, but no unrelated refactoring.
  Rationale: This creates a clear legal and operational baseline that can be reviewed independently from implementation changes.
  Date: 2026-07-15

- Decision: Refactoring begins only after the governance commit passes validation.
  Rationale: Structural code changes should not obscure or complicate review of relicensing and attribution changes.
  Date: 2026-07-15

- Decision: Refactoring commits must be grouped by a single coherent purpose and remain buildable whenever practical.
  Rationale: Logical commits improve review, bisectability, rollback, and future maintenance.
  Date: 2026-07-15

- Decision: Treat the generated `resources/maven-metadata.xml`, the VS Code quickstart scaffold, binary assets, and legacy modernization ignore file as explicit validator exclusions; validate headers only on executable first-party source/templates and newly added governance tooling.
  Rationale: These paths either have authoritative generated/scaffold content or cannot carry a syntactically safe file header. The validator still scans all eligible current text for the obsolete contact address.
  Date: 2026-07-15

- Decision: Defer the TypeScript/@types VS Code compatibility repair to a post-governance build refactoring commit.
  Rationale: The failure is pre-existing dependency-resolution drift caused by the unpinned development dependency range, not a licensing or attribution change. Keeping it separate preserves the reviewable governance baseline.
  Date: 2026-07-15

- Decision: Pin `@types/vscode` to `1.40.0` in a standalone `refactor(build)` commit, while retaining the established TypeScript `^3.6.4` range.
  Rationale: The extension declares VS Code engine `^1.40.0`; the old caret on its corresponding type definitions resolved to 1.125.0, whose declarations cannot be parsed by the resolved TypeScript 3.9.10 compiler. The exact historical API type package restores a reproducible compatible bound without changing runtime dependencies or extension behavior.
  Date: 2026-07-15

- Decision: Replace deprecated `vscode-test` with `@vscode/test-electron` in a separate `refactor(test)` commit.
  Rationale: npm marks `vscode-test` as renamed, and its current resolved wrapper cannot launch VS Code 1.129.0 in this macOS environment. The maintained successor provides the same `runTests` API used by `src/test/runTest.ts` and supports the active Node.js runtime.
  Date: 2026-07-15

- Decision: Use the maintained `@vscode/test-electron` 2.5 release line rather than 3.0.0.
  Rationale: Version 3.0.0 requires a newer TypeScript declaration environment than this extension's compiler; the current 2.5 line supports Node.js 16 or later while avoiding that compiler incompatibility. The range keeps compatible maintenance updates within the selected major version.
  Date: 2026-07-15

- Decision: Delete `ELECTRON_RUN_AS_NODE` in `src/test/runTest.ts` before launching integration tests.
  Rationale: This environment marker is correct for the host process that starts Codex but incorrect for the child VS Code application. The test script is the narrowest boundary at which to prevent the inheritance without changing user runtime behavior.
  Date: 2026-07-15

- Decision: Keep the historical MIT header on `src/test/runTest.ts` after the narrow test-runner changes.
  Rationale: The file remains predominately 2019 TotalCross work; the import and environment sanitization are a minimal compatibility adjustment. The validator records it as historical work and preserves the existing MIT notice rather than asserting an unsupported whole-file relicensing.
  Date: 2026-07-15

## Outcomes & Retrospective

The `master` branch of `TotalCross/totalcross-vscode-plugin` was inspected at
`6948213`; the remote history, tags, and old commit identities were preserved
unchanged. The prior top-level `LICENSE` was MIT with a 2019 TotalCross notice.
It is now Apache License 2.0 for the current repository baseline. `README.md`
states that distributions released before this governance change may remain
available under their accompanying MIT terms and that current controlled work
is Apache-2.0 unless a file states otherwise.

One current-content obsolete-contact occurrence was found in the old README
and removed. No occurrence remains in current tracked content. Git commit
metadata was intentionally not rewritten. `AUTHORS.md` preserves the original
creator Italo Yeltsin, the sole current maintainer Fabio Sobral, and historical
contributors Allan C, lucasgalvanini, @nmarquesin, and Ricardo Braga based on
the former README or Git history.

`README.md`, `AUTHORS.md`, `NOTICE`, `CONTRIBUTING.md`, `AGENTS.md`, and
`.github/CODEOWNERS` identify the roles and transition. Twenty-one historical
first-party source/template files carry TotalCross MIT headers. Nine new
governance/tooling documents or scripts carry Amalgam Apache-2.0 headers.
No mixed-history production file was found before refactoring; the later narrow
test-runner edit retains the existing historical MIT header as documented in
the decision log. `resources/maven-metadata.xml` is treated as generated;
the VS Code quickstart scaffold, binary assets, and a legacy modernization
ignore file are explicit exclusions. No unresolved ownership ambiguity remains
within the files changed by this work, but the prospective relicensing authority
is represented by the requested governance decision rather than independent
external legal verification.

The local governance checks are `python3 tools/check-repository-governance.py`
and `python3 -m unittest tests.test_repository_governance`; the GitHub Actions
workflow is `.github/workflows/governance-validation.yml`. The validator passed
and its 14 unit tests passed. `npm run compile` passed after the build
dependency correction. `npm test` passed with two extension tests using VS Code
1.129.0 and exited with code 0.

The governance commit is `ca549be4b8428ae260df05ec9529578e687fcaac`
(`chore(governance): migrate project licensing to Apache-2.0`). The later
`b7072bd` pins `@types/vscode` to 1.40.0 so TypeScript can parse the VS Code
API types. `d8dc0e6` replaces the deprecated test wrapper and prevents the
host's Electron Node-mode environment marker from breaking integration tests.
No public extension command, runtime dependency, API, resource path, or
platform behavior changed. Broader source reorganization and security-related
cleanup were considered but rejected because the small codebase has sparse
behavioral coverage and those changes were not necessary to make the baseline
valid and buildable. npm reports 17 dependency vulnerabilities after the final
install; dependency security modernization is a separate follow-up.

## Editorial Report

### Editorial Summary

This work establishes a truthful legal and maintenance baseline for the
TotalCross VS Code extension. Users and contributors can now see the current
Apache-2.0 license, the continuing MIT status of historical TotalCross source,
the original creator, and the sole current maintainer. A local validator and
matching CI workflow make those rules repeatable rather than relying on manual
review alone.

The execution also restored a usable development verification path: compilation
uses a compatible VS Code type definition package, and the extension tests run
successfully from a VS Code-hosted development environment.

### Original Plan versus Actual Outcome

The governance transition, attribution documentation, header normalization,
validator, tests, CI, and logical baseline commit were delivered as planned.
The code review found no safe structural reorganization worth manufacturing.
Instead, it found two concrete build/test compatibility regressions caused by
dependency and host-environment drift; those were resolved in two separately
reviewable refactoring commits.

### What Changed

`LICENSE`, `NOTICE`, `README.md`, `AUTHORS.md`, `CONTRIBUTING.md`, `AGENTS.md`,
and `.github/CODEOWNERS` define the project license, ownership history, and
maintenance roles. `tools/check-repository-governance.py` validates headers,
attribution, and obsolete contact information, while
`tests/test_repository_governance.py` supplies its focused tests and
`.github/workflows/governance-validation.yml` runs them in CI. Historical
headers were added to `src/`, first-party `resources/`, and `test.sh`.

`package.json` pins the VS Code API type package and adopts
`@vscode/test-electron`. `src/test/runTest.ts` clears an inherited process
variable before launching VS Code so the integration application is not forced
into Node mode.

### Decisions and Trade-offs

The repository transition is prospective: the current root license changes,
but historical source retains MIT headers. This avoids claiming that prior
releases were retroactively relicensed. Header enforcement deliberately uses a
small Python script and explicit path categories, trading automatic historical
inference for readable, auditable rules. The maintained test package is kept on
its 2.5 major line because its 3.0 declarations are incompatible with the
project's TypeScript compiler.

### Unexpected Problems and Discoveries

An unpinned VS Code type dependency resolved to 1.125.0, which TypeScript 3.9
could not parse. The deprecated test wrapper then failed to launch a current
macOS VS Code, and the maintained replacement initially inherited
`ELECTRON_RUN_AS_NODE=1` from the host process. Removing that variable at the
test launcher boundary produced a successful test run.

### Validation and Measurable Results

Observed successful commands were:

    python3 tools/check-repository-governance.py
    python3 -m unittest tests.test_repository_governance
    npm run compile
    npm test

The governance validator passed; 14 governance tests passed; compilation
passed; and the VS Code integration run reported two passing tests and exit
code 0. The final search found zero current-content occurrences of the obsolete
contact address. No performance or artifact-size measurement was taken.

### Useful Evidence and Examples

The three commits `ca549be`, `b7072bd`, and `d8dc0e6` separate the governance,
build, and test work. `tools/check-repository-governance.py` and
`tests/test_repository_governance.py` provide reproducible policy evidence.
The final `npm test` transcript records the two passing extension tests.

### Limitations, Remaining Work, and Open Questions

The authority for prospective relicensing follows the requested governance
decision and was not independently verified with external legal records.
The repository has no lockfile, so transitive dependencies can still drift.
npm reports 17 vulnerabilities in the installed dependency tree; resolving
them safely requires a dedicated dependency upgrade and compatibility review.
Existing extension tests remain minimal and do not characterize deployment,
packaging, or project-creation behavior.

### Possible Article Angles

- For maintainers of older extensions: "Separating a license transition from
  compatibility fixes" explains how small, logical commits preserve legal and
  technical reviewability.
- For extension-tooling maintainers: "Why VS Code integration tests started
  Node instead of Electron" shows how inherited host environment variables can
  change a child process's execution mode.
- For open-source maintainers: "Turning repository governance into a test"
  shows a dependency-light approach to validating headers and attribution.

### Suggested Narrative

Start with a legacy extension whose legal metadata and tooling have drifted.
Explain the constraint that historical MIT work must remain truthful. Introduce
the governance baseline and its validator, then show the unexpected type and
Electron-launch failures discovered only through real verification. Conclude
with the isolated fixes, passing checks, and the remaining dependency-security
work.

### Claims Requiring Human Review

The stated ownership periods, prospective relicensing authority, historical
contributor identities, and sole-maintainer status are externally visible and
should receive legal and maintainer review before publication or release.

## Context and Orientation

Start by locating repository instructions and understanding the current state:

    pwd
    git rev-parse --show-toplevel
    git status --short --branch
    git remote -v
    git log --oneline --decorate --graph --all --max-count=80
    git tag --list --sort=-creatordate | sed -n '1,80p'
    find .. \( -name AGENTS.md -o -name PLANS.md -o -path '*/.agent/PLANS.md' -o -path '*/.agents/PLANS.md' \) -print

Read all applicable instruction files before editing.

Inventory the repository without traversing generated dependency trees:

    find . -maxdepth 5 -type f \
      ! -path './.git/*' \
      ! -path './build/*' \
      ! -path './dist/*' \
      ! -path './out/*' \
      ! -path './target/*' \
      ! -path './node_modules/*' \
      | sort | sed -n '1,500p'

Inspect legal, attribution, and contact information:

    git grep -n -I -E \
      'br\.yeltsin@gmail\.com|Italo Yeltsin|ItaloYeltsin|Fabio Sobral|flsobral|Copyright|SPDX-License-Identifier|SPDX-FileCopyrightText|MIT License|Apache License|maintainer|author|contributor' \
      -- . \
      ':(exclude)build/**' \
      ':(exclude)dist/**' \
      ':(exclude)out/**' \
      ':(exclude)target/**' \
      ':(exclude)node_modules/**' \
      || true

Inspect authorship evidence from Git without rewriting it:

    git shortlog -sne --all
    git log --format='%aN <%aE>' --all | sort -fu
    git log --format='%cN <%cE>' --all | sort -fu
    git log --follow --format='%h %ad %an <%ae> %s' --date=short -- path/to/important/file

Use `git blame`, `git log --follow`, release tags, imported-source records, and existing notices to classify ambiguous files. Do not infer ownership solely from the most recent editor.

Inspect build and test entry points:

    find . -maxdepth 4 -type f \( \
      -name 'build.gradle' -o \
      -name 'build.gradle.kts' -o \
      -name 'settings.gradle' -o \
      -name 'settings.gradle.kts' -o \
      -name 'gradlew' -o \
      -name 'pom.xml' -o \
      -name 'CMakeLists.txt' -o \
      -name 'Makefile' -o \
      -name 'package.json' -o \
      -name 'Cargo.toml' \
    \) -print | sort

## License Transition Rules

### Repository license files

Replace the current top-level MIT license file with the complete Apache License 2.0 text in `LICENSE` or the repository's established license filename.

Add `NOTICE` when appropriate. At minimum it should identify:

- the current project name;
- original project creation by Italo Yeltsin (`@ItaloYeltsin`);
- current maintenance by Fabio Sobral (`@flsobral`);
- the historical MIT licensing period where applicable;
- Amalgam Solucoes em TI Ltda. as the 2022–2026 copyright holder where applicable;
- preservation of third-party notices.

Do not place terms in `NOTICE` that contradict Apache-2.0 or attempt to revoke historical MIT permissions.

Document the transition in README or a dedicated licensing section with wording equivalent to:

    Versions and source distributions released before this license transition may
    remain available under the MIT License terms that accompanied them. From this
    governance change onward, project work controlled by the current copyright
    holder is licensed under the Apache License, Version 2.0, unless a file states
    otherwise.

Adapt wording to verified repository history and release facts.

### Canonical file-header categories

Prefer SPDX metadata, but retain requested human-readable copyright lines when they are part of the project's established header format.

#### Historical TotalCross files

For a file whose controlled first-party content belongs only to the 2020–2021 period:

    Copyright (C) 2020-2021 TotalCross Global Mobile Platform Ltda.
    SPDX-License-Identifier: MIT

Do not change it to Apache-2.0 merely because the repository's current license changed.

#### Amalgam files

For a file created entirely in the 2022–2026 Amalgam period, or for a new file added by this work:

    Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
    SPDX-License-Identifier: Apache-2.0

For a file first created in a later year, do not invent 2022 unless the project explicitly requires a common range. Record and follow the repository's legal convention.

#### Mixed-history files

For files containing material from both periods, use both copyright statements when supported:

    Copyright (C) 2020-2021 TotalCross Global Mobile Platform Ltda.
    Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
    SPDX-License-Identifier: Apache-2.0

Before applying Apache-2.0 to the combined current file, confirm that the relevant rights holder is authorized to relicense the inherited MIT code and that no contributor-specific restriction prevents it. MIT permits redistribution under additional terms provided its notice is preserved, but the original MIT notice and disclaimer must remain available where legally required. Record the chosen representation in `Decision Log`.

If the safest accurate treatment is dual licensing or preserving an MIT identifier for a particular file, do not force Apache-2.0. Record the exception.

#### Third-party and generated files

Do not replace, remove, or normalize third-party notices. Do not manually edit generated files when the generator can be changed instead.

### Comment syntax

Preserve shebangs, XML declarations, encoding declarations, and generated markers.

C-style example:

    /*
     * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
     * SPDX-License-Identifier: Apache-2.0
     */

Hash-comment example:

    # Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
    # SPDX-License-Identifier: Apache-2.0

XML example:

    <!--
      Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
      SPDX-License-Identifier: Apache-2.0
    -->

## Attribution and Governance Files

### `README.md`

Update the README to include concise, visible sections covering:

- project purpose and supported use;
- license and transition note;
- original creator: Italo Yeltsin (`@ItaloYeltsin`);
- sole maintainer: Fabio Sobral (`@flsobral`);
- link to `AUTHORS.md` or contributors documentation;
- local build, test, and validation commands;
- contribution entry point.

Remove the obsolete former project contact address. Do not replace it with another email unless explicitly requested.

### `AUTHORS.md`

Create or update with a structure similar to:

    # Authors and contributors

    ## Original creator

    Italo Yeltsin ([@ItaloYeltsin](https://github.com/ItaloYeltsin))

    ## Current maintainer

    Fabio Sobral ([@flsobral](https://github.com/flsobral))

    Fabio Sobral is the sole current maintainer.

    ## Historical contributors

    - <preserved names discovered in the repository>

    Additional contributors are recorded in Git history.

    ## Copyright history

    - 2020-2021: TotalCross Global Mobile Platform Ltda., for applicable original work.
    - 2022-2026: Amalgam Solucoes em TI Ltda., for applicable later work.

Do not invent contributor names. Deduplicate spelling variants only after checking Git history and repository evidence.

### `.github/CODEOWNERS`

Set Fabio Sobral as the default current code owner:

    * @flsobral

Preserve valid path-specific rules if they still reflect active ownership. Remove obsolete rules that designate former maintainers only after recording the change.

### `CONTRIBUTING.md`

Document:

- the current Apache-2.0 contribution license expectation;
- the historical-license exception policy;
- required headers for new first-party files;
- prohibition against changing third-party notices;
- the local validation command;
- build and test commands;
- commit expectations for coherent changes;
- how to update generated files and their generators;
- that Fabio Sobral is the sole current maintainer and reviewer of record.

Do not assert copyright assignment or a contributor license agreement unless one actually exists.

### `AGENTS.md`

Create a repository-root `AGENTS.md` that tells coding agents to:

- read `AGENTS.md` and `.agent/PLANS.md` before modifying files;
- inspect Git status and repository instructions first;
- preserve historical copyright and third-party notices;
- never reintroduce the obsolete former project contact address;
- use Apache-2.0 headers for new first-party files unless a documented exception applies;
- avoid broad formatting or refactoring in governance-only changes;
- keep commits logical, buildable, and narrowly described;
- prefer focused validation before expensive full builds;
- keep build output concise and save verbose logs to files when useful;
- update an active ExecPlan while performing long or multi-step work;
- avoid rewriting history, force-pushing, deleting tags, or changing release artifacts without explicit authorization;
- report unresolved licensing or provenance ambiguity instead of guessing.

Include repository-specific build, test, formatting, and validation commands discovered during inspection.

### `.agent/PLANS.md`

Create `.agent/PLANS.md` defining the required structure and maintenance rules for Codex ExecPlans in this repository.

It must require at least:

- `Purpose / Big Picture`;
- `Progress` with timestamped checkboxes when useful;
- `Surprises & Discoveries`;
- `Decision Log`;
- `Outcomes & Retrospective`;
- concrete file paths and commands;
- observable acceptance criteria;
- continuous updates during execution;
- explicit documentation of deviations and unresolved risks.

Use `.agent/PLANS.md` exactly as requested. Do not silently substitute `.agents/PLANS.md`; if an existing convention uses the plural directory, document the conflict and either migrate references consistently or preserve a compatibility pointer.

## Validation Tooling

Implement a deterministic, dependency-light validator in the repository's existing scripting language where practical.

It must:

1. enumerate tracked candidate files using Git, preferably `git ls-files -z`;
2. classify paths through explicit inclusion and exclusion rules;
3. validate expected copyright and SPDX combinations;
4. reject `SPDX-License-Identifier: MIT` for new Amalgam-era first-party files unless explicitly excepted;
5. reject removal of required historical MIT notices from classified historical files;
6. reject the obsolete former project contact address in first-party tracked content;
7. verify README, AUTHORS, CODEOWNERS, AGENTS, and `.agent/PLANS.md` contain required current attribution;
8. ensure Italo Yeltsin is identified as original creator, not current maintainer;
9. ensure Fabio Sobral is identified as sole current maintainer;
10. preserve an explicit allowlist for third-party, generated, fixtures, and unavoidable historical artifacts;
11. print concise, sorted, path-based diagnostics;
12. exit nonzero on failure;
13. avoid modifying files;
14. support paths containing spaces and non-ASCII characters.

Suitable commands might be:

    python3 tools/check-repository-governance.py
    python3 -m unittest tests.test_repository_governance

Use actual repository conventions and document the final commands in README, CONTRIBUTING, AGENTS, and CI.

At minimum test:

- valid historical MIT header;
- valid Amalgam Apache-2.0 header;
- valid mixed-history header;
- missing historical notice;
- incorrect owner/year combination;
- obsolete email detection;
- third-party exclusion;
- generated-file exclusion;
- Italo incorrectly marked as current maintainer;
- Fabio missing as sole maintainer;
- deterministic diagnostics;
- path containing spaces;
- shebang and XML declaration placement.

## Required First Commit: Governance and License Transition

The first commit must include all related governance changes and header normalization together, and must exclude unrelated implementation refactoring.

Expected content includes, as applicable:

    LICENSE
    NOTICE
    README.md
    AUTHORS.md
    CONTRIBUTING.md
    AGENTS.md
    .agent/PLANS.md
    .github/CODEOWNERS
    .github/workflows/<governance-validation>.yml
    tools/<validator>
    tests/<validator-tests-or-fixtures>
    all applicable first-party files whose headers are normalized
    project metadata files containing obsolete contact, authorship, maintainer, or license information

Before staging, produce explicit inventories:

    git grep -n -I 'br\.yeltsin@gmail\.com' -- . || true
    git grep -n -I -E 'SPDX-License-Identifier: MIT|SPDX-License-Identifier: Apache-2.0' -- . || true
    git status --short

Stage deliberately. Review:

    git diff --check
    git diff --cached --stat
    git diff --cached -- LICENSE NOTICE README.md AUTHORS.md CONTRIBUTING.md AGENTS.md .agent/PLANS.md .github tools tests
    git diff --cached

Run validators and focused build/tests before committing.

Recommended commit message:

    chore(governance): migrate project licensing to Apache-2.0

The commit body should explain:

- prospective MIT to Apache-2.0 transition;
- preserved historical MIT attribution;
- original creator and current maintainer roles;
- obsolete email removal;
- addition of validators, CI, AGENTS, and planning rules;
- project-wide header normalization.

Do not split this governance baseline into several commits unless a repository instruction explicitly requires it. Do not include code cleanup, renaming, package moves, formatting-only sweeps, behavior changes, or dependency upgrades unrelated to making the governance baseline valid.

## Post-Governance Code Review

After the first commit is complete, start from a clean working tree and inspect the code systematically.

Review:

- module and package boundaries;
- source and test directory organization;
- public API versus implementation details;
- duplicated or dead code;
- naming consistency;
- dependency direction and cycles;
- platform-specific code placement;
- generated code and generators;
- build scripts and dependency declarations;
- error handling and resource lifecycle;
- test coverage and testability;
- unnecessary compatibility layers;
- documentation that no longer matches behavior;
- large files or classes with multiple responsibilities;
- opportunities to separate reusable core logic from adapters or platform integrations.

Use static tools already present in the repository. Do not add a major formatter, linter, dependency, or build system merely to perform cleanup unless the benefit is documented and separately reviewable.

Before structural changes, add characterization tests when behavior is not adequately protected.

## Logical Refactoring Commit Strategy

Each refactoring commit must have one primary purpose. Examples, used only when supported by the actual project:

1. `test(core): add characterization coverage for current behavior`
2. `refactor(build): normalize source sets and generated outputs`
3. `refactor(core): separate parsing from execution`
4. `refactor(platform): isolate platform-specific adapters`
5. `refactor(api): clarify internal and public package boundaries`
6. `refactor(resources): centralize resource loading and cleanup`
7. `docs(architecture): document the reorganized module structure`

For every proposed group:

- record the problem and evidence in `Decision Log`;
- list exact files and expected behavioral impact;
- identify compatibility risks;
- run focused tests before and after;
- avoid mixing formatting-only changes with semantic changes;
- avoid moving and rewriting a file in the same commit when that would make review unnecessarily difficult;
- update imports, build configuration, tests, and documentation in the same commit when required to keep the tree buildable;
- use `git diff --check` and inspect the complete staged diff;
- include the reason for the change in the commit body, not only a description of file movements.

If no meaningful refactoring is justified, do not manufacture changes. Record that the review found no safe, valuable reorganization within scope.

## Validation and Acceptance

The plan is complete only when all applicable conditions are observable:

- the current top-level license is Apache License 2.0;
- historical MIT permissions and notices are not falsely revoked or erased;
- the obsolete former project contact address is absent from first-party current repository content, subject to documented exclusions;
- Italo Yeltsin is clearly identified as original creator;
- Fabio Sobral is clearly identified as the sole current maintainer;
- all previously credited legitimate people remain in a historical contributors list;
- `.github/CODEOWNERS` identifies `@flsobral` as the default current owner;
- `AGENTS.md` exists and contains repository-specific operational rules;
- `.agent/PLANS.md` exists and defines ExecPlan requirements;
- applicable source headers match their verified historical category;
- third-party and generated notices remain intact;
- validators pass locally and in CI;
- README and CONTRIBUTING document the exact validation command;
- the governance commit contains no unrelated refactoring;
- each later refactoring commit is coherent, justified, and validated;
- the final supported build and test suite passes, or every pre-existing failure is clearly distinguished from regressions introduced by this work;
- the working tree is clean;
- the final commit history is understandable without external explanation.

## Final Review Checklist

- [x] Existing repository instructions were read and followed.
- [x] No Git history was rewritten.
- [x] Apache-2.0 license text is complete and authoritative.
- [x] Historical MIT licensing is accurately documented.
- [x] The obsolete former project contact address has been removed; no current-content occurrence remains.
- [x] Italo Yeltsin is credited as original creator.
- [x] Fabio Sobral is the sole current maintainer.
- [x] Historical contributors are preserved.
- [x] TotalCross 2020–2021 headers retain MIT where applicable.
- [x] Amalgam 2022–2026 headers use Apache-2.0 where applicable.
- [x] Mixed-history files were reviewed; no production mixed file requires a combined header.
- [x] Third-party notices were not overwritten.
- [x] Generated files were left intact; no generator update was necessary.
- [x] `AGENTS.md` exists and is repository-specific.
- [x] `.agent/PLANS.md` exists and is referenced consistently.
- [x] Validator tests pass.
- [x] CI invokes the same validator command documented locally.
- [x] The first commit contains governance only, including required header changes.
- [x] Refactoring began only after the governance commit.
- [x] Each refactoring commit has one coherent purpose.
- [x] Public API and compatibility impacts are documented.
- [x] Full final build/tests pass.
- [x] `git diff --check` passes.
- [x] Working tree is clean after this plan-record commit.
- [x] `Outcomes & Retrospective` is complete.

Revision note (2026-07-15): recorded the completed governance transition,
dependency and test-runner compatibility refactorings, observed validation
results, remaining dependency-security work, and the final Editorial Report.
