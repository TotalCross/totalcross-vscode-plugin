#!/usr/bin/env python3
# Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
# SPDX-License-Identifier: Apache-2.0

"""Validate tracked governance metadata and first-party license headers."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

HISTORICAL_COPYRIGHT = "Copyright (C) 2020-2021 TotalCross Global Mobile Platform Ltda."
AMALGAM_COPYRIGHT = "Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda."
MIT = "SPDX-License-Identifier: MIT"
APACHE = "SPDX-License-Identifier: Apache-2.0"
OBSOLETE_EMAIL = "br.yeltsin" + "@gmail.com"

HISTORICAL_PATHS = ("src/", "resources/")
HISTORICAL_EXCLUSIONS = {"resources/maven-metadata.xml"}
AMALGAM_C_PATHS = {
    "src/maven-metadata.ts",
    "src/test/suite/maven-metadata.test.ts",
    "tools/check-repository-governance.py",
    "tests/test_repository_governance.py",
}
AMALGAM_HASH_PATHS = {
    ".github/CODEOWNERS",
    ".github/workflows/governance-validation.yml",
}
AMALGAM_HTML_PATHS = {"AGENTS.md", "AUTHORS.md", "CONTRIBUTING.md", ".agent/PLANS.md"}
MIXED_FIXTURE_PREFIX = "tests/fixtures/mixed-history/"
EXCLUDED_PREFIXES = (".git/", "out/", "node_modules/", "tests/fixtures/")
EXCLUDED_PATHS = {
    ".github/modernize/java-upgrade/.gitignore",
    "vsc-extension-quickstart.md",
}


def tracked_paths(root: Path) -> list[str]:
    result = subprocess.run(
        ["git", "-C", str(root), "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return sorted(path for path in result.stdout.decode("utf-8").split("\0") if path)


def classify(path: str) -> str:
    if path.startswith(MIXED_FIXTURE_PREFIX):
        return "mixed"
    if path in EXCLUDED_PATHS or path in HISTORICAL_EXCLUSIONS or path.startswith(EXCLUDED_PREFIXES):
        return "excluded"
    if path in AMALGAM_C_PATHS or path in AMALGAM_HASH_PATHS or path in AMALGAM_HTML_PATHS:
        return "amalgam"
    if path == "test.sh" or (path.startswith(HISTORICAL_PATHS) and path not in HISTORICAL_EXCLUSIONS):
        return "historical"
    return "metadata"


def read_text(root: Path, path: str) -> str:
    return (root / path).read_text(encoding="utf-8", errors="replace")


def expected_header(path: str, category: str) -> tuple[str, str] | None:
    if category == "historical":
        return HISTORICAL_COPYRIGHT, MIT
    if category == "mixed":
        return AMALGAM_COPYRIGHT, APACHE
    if category == "amalgam":
        return AMALGAM_COPYRIGHT, APACHE
    return None


def header_is_placed_correctly(path: str, contents: str, category: str) -> bool:
    first, second = expected_header(path, category) or ("", "")
    lines = contents.splitlines()
    if path.endswith(".xml"):
        header = "\n".join(lines[1:6])
        return len(lines) >= 4 and lines[0].startswith("<?xml") and first in header and second in header
    if path.endswith(".sh"):
        header = "\n".join(lines[1:5])
        return len(lines) >= 3 and lines[0].startswith("#!") and first in header and second in header
    early_contents = "\n".join(lines[:9])
    return first in early_contents and second in early_contents


def has_spdx_header(contents: str, identifier: str) -> bool:
    return any(line.lstrip("# /*\t").strip() == identifier for line in contents.splitlines())


def validate_metadata(root: Path, paths: list[str]) -> list[str]:
    errors: list[str] = []
    present = set(paths)
    required = {
        "README.md",
        "AUTHORS.md",
        "CONTRIBUTING.md",
        "AGENTS.md",
        "NOTICE",
        "LICENSE",
        "package-lock.json",
        ".agent/PLANS.md",
        ".github/CODEOWNERS",
        ".github/workflows/governance-validation.yml",
    }
    for path in sorted(required - present):
        errors.append(f"{path}: required governance file is not tracked")
    if required - present:
        return errors

    readme = read_text(root, "README.md")
    authors = read_text(root, "AUTHORS.md")
    agents = read_text(root, "AGENTS.md")
    contributing = read_text(root, "CONTRIBUTING.md")
    notice = read_text(root, "NOTICE")
    license_text = read_text(root, "LICENSE")
    lockfile = read_text(root, "package-lock.json")
    codeowners = read_text(root, ".github/CODEOWNERS")
    plans = read_text(root, ".agent/PLANS.md")
    if "original creator" not in readme.lower() or "Italo Yeltsin" not in readme:
        errors.append("README.md: must identify Italo Yeltsin as original creator")
    if "Fabio Sobral" not in readme or "sole current maintainer" not in readme:
        errors.append("README.md: must identify Fabio Sobral as sole current maintainer")
    if "## Original creator" not in authors or "Italo Yeltsin" not in authors:
        errors.append("AUTHORS.md: must identify Italo Yeltsin as original creator")
    if "## Current maintainer" not in authors or "Fabio Sobral is the sole current maintainer." not in authors:
        errors.append("AUTHORS.md: must identify Fabio Sobral as sole current maintainer")
    if "Fabio Sobral is the sole current maintainer" not in agents:
        errors.append("AGENTS.md: must identify Fabio Sobral as sole current maintainer")
    if "Apache-2.0" not in contributing or "python3 tools/check-repository-governance.py" not in contributing:
        errors.append("CONTRIBUTING.md: must document Apache-2.0 and the governance command")
    if "Italo Yeltsin" not in notice or "Fabio Sobral" not in notice or "MIT" not in notice or "Apache" not in notice:
        errors.append("NOTICE: must preserve required attribution and transition information")
    if "Apache License" not in license_text or "Version 2.0, January 2004" not in license_text:
        errors.append("LICENSE: must contain the complete Apache License 2.0 text")
    try:
        if not isinstance(json.loads(lockfile).get("lockfileVersion"), int):
            errors.append("package-lock.json: must be a valid npm lockfile")
    except ValueError:
        errors.append("package-lock.json: must be valid JSON")
    if "* @flsobral" not in codeowners:
        errors.append(".github/CODEOWNERS: must assign the default owner to @flsobral")
    if "Editorial Report" not in plans or "Outcomes & Retrospective" not in plans:
        errors.append(".agent/PLANS.md: must define complete ExecPlan requirements")
    return errors


def validate(root: Path) -> list[str]:
    paths = tracked_paths(root)
    errors = validate_metadata(root, paths)
    for path in paths:
        category = classify(path)
        if category == "excluded":
            continue
        contents = read_text(root, path)
        if OBSOLETE_EMAIL in contents:
            errors.append(f"{path}: contains obsolete project contact information")
        expected = expected_header(path, category)
        if expected and not header_is_placed_correctly(path, contents, category):
            errors.append(f"{path}: missing or misplaced required {category} copyright/SPDX header")
        if category == "historical" and has_spdx_header(contents, APACHE):
            errors.append(f"{path}: historical TotalCross work must retain its MIT SPDX identifier")
        if category == "amalgam" and has_spdx_header(contents, MIT):
            errors.append(f"{path}: Amalgam-era first-party work must not use the MIT SPDX identifier")
        if category == "mixed" and (HISTORICAL_COPYRIGHT not in contents or AMALGAM_COPYRIGHT not in contents):
            errors.append(f"{path}: mixed-history work must retain both copyright statements")
    return sorted(errors)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    try:
        errors = validate(args.root.resolve())
    except subprocess.CalledProcessError as error:
        sys.stderr.write(error.stderr.decode("utf-8", errors="replace"))
        return 2
    if errors:
        print("Repository governance validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("Repository governance validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
