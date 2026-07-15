<!--
Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
SPDX-License-Identifier: Apache-2.0
-->

# Contributing

Fabio Sobral is the sole current maintainer and reviewer of record. Open a
focused pull request with one coherent purpose and a concise commit message.

## License and notices

New first-party source files must use the Amalgam Apache-2.0 header:

    Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
    SPDX-License-Identifier: Apache-2.0

Use the comment syntax appropriate for the file, preserving a shebang or XML
declaration as the first line. Do not remove or rewrite historical TotalCross
MIT notices, third-party notices, generated artifacts, or separately licensed
content. If a file has mixed provenance or an unclear owner, stop and document
the uncertainty for maintainer review rather than guessing.

Contributions are expected to be offered under Apache License 2.0 for the new
work they add, except where a documented historical or third-party license
requires another treatment. This repository does not assert a contributor
license agreement or copyright assignment.

## Local checks

Run these commands from the repository root before opening a pull request:

    python3 tools/check-repository-governance.py
    python3 -m unittest tests.test_repository_governance
    npm run compile

Run `npm test` when the VS Code integration-test prerequisites are available.
The governance validator is read-only and uses only tracked files. Generated
files must be changed through their generator when one exists.

## Commit expectations

Keep commits narrow, buildable where practical, and free of unrelated
formatting sweeps. Run focused checks before expensive full builds, inspect
`git diff --check`, and include any required test, import, configuration, and
documentation changes in the same coherent commit.
