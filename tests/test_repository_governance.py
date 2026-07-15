# Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
# SPDX-License-Identifier: Apache-2.0

import importlib.util
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("governance", ROOT / "tools/check-repository-governance.py")
governance = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(governance)


class RepositoryGovernanceTest(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self.root = Path(self.tempdir.name)
        self.write("README.md", "The original creator is Italo Yeltsin. Fabio Sobral is the sole current maintainer.\n")
        html_header = f"<!--\n{governance.AMALGAM_COPYRIGHT}\n{governance.APACHE}\n-->\n"
        hash_header = f"# {governance.AMALGAM_COPYRIGHT}\n# {governance.APACHE}\n"
        self.write("AUTHORS.md", html_header + "## Original creator\nItalo Yeltsin\n## Current maintainer\nFabio Sobral is the sole current maintainer.\n")
        self.write("CONTRIBUTING.md", html_header + "Apache-2.0\npython3 tools/check-repository-governance.py\n")
        self.write("AGENTS.md", html_header + "Fabio Sobral is the sole current maintainer.\n")
        self.write("NOTICE", "Italo Yeltsin\nFabio Sobral\nMIT\nApache\n")
        self.write("LICENSE", "Apache License\nVersion 2.0, January 2004\n")
        self.write("package-lock.json", "{\"lockfileVersion\": 3, \"packages\": {}}\n")
        self.write(".agent/PLANS.md", html_header + "Outcomes & Retrospective\nEditorial Report\n")
        self.write(".github/CODEOWNERS", hash_header + "* @flsobral\n")
        self.write(".github/workflows/governance-validation.yml", hash_header + "name: test\n")

    def tearDown(self):
        self.tempdir.cleanup()

    def write(self, relative: str, contents: str):
        target = self.root / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(contents, encoding="utf-8")

    def track(self):
        subprocess.run(["git", "init", "-q", str(self.root)], check=True)
        subprocess.run(["git", "-C", str(self.root), "add", "-A"], check=True)

    def errors_for(self, relative: str, contents: str):
        self.write(relative, contents)
        self.track()
        return governance.validate(self.root)

    def test_valid_historical_mit_header(self):
        errors = self.errors_for("src/example.ts", f"/*\n * {governance.HISTORICAL_COPYRIGHT}\n * {governance.MIT}\n */\nexport {{}};\n")
        self.assertEqual([], errors)

    def test_valid_amalgam_apache_header(self):
        errors = self.errors_for("tools/check-repository-governance.py", f"# {governance.AMALGAM_COPYRIGHT}\n# {governance.APACHE}\n")
        self.assertEqual([], errors)

    def test_new_amalgam_source_header_is_validated(self):
        errors = self.errors_for("src/maven-metadata.ts", f"/*\n * {governance.AMALGAM_COPYRIGHT}\n * {governance.APACHE}\n */\n")
        self.assertEqual([], errors)

    def test_amalgam_mit_header_is_rejected(self):
        errors = self.errors_for("tools/check-repository-governance.py", f"# {governance.AMALGAM_COPYRIGHT}\n# {governance.MIT}\n")
        self.assertIn("tools/check-repository-governance.py: missing or misplaced required amalgam copyright/SPDX header", errors)
        self.assertIn("tools/check-repository-governance.py: Amalgam-era first-party work must not use the MIT SPDX identifier", errors)

    def test_valid_mixed_history_header(self):
        contents = f"/*\n * {governance.HISTORICAL_COPYRIGHT}\n * {governance.AMALGAM_COPYRIGHT}\n * {governance.APACHE}\n */\n"
        errors = self.errors_for("tests/fixtures/mixed-history/example.ts", contents)
        self.assertEqual([], errors)

    def test_missing_historical_notice_is_reported(self):
        errors = self.errors_for("src/example.ts", f"/* {governance.MIT} */\n")
        self.assertIn("src/example.ts: missing or misplaced required historical copyright/SPDX header", errors)

    def test_historical_apache_header_is_rejected(self):
        errors = self.errors_for("src/example.ts", f"/*\n * {governance.HISTORICAL_COPYRIGHT}\n * {governance.APACHE}\n */\n")
        self.assertIn("src/example.ts: missing or misplaced required historical copyright/SPDX header", errors)
        self.assertIn("src/example.ts: historical TotalCross work must retain its MIT SPDX identifier", errors)

    def test_wrong_owner_and_year_is_reported(self):
        errors = self.errors_for("src/example.ts", f"/*\n * {governance.AMALGAM_COPYRIGHT}\n * {governance.MIT}\n */\n")
        self.assertIn("src/example.ts: missing or misplaced required historical copyright/SPDX header", errors)

    def test_obsolete_contact_is_reported(self):
        email = "br.yeltsin" + "@gmail.com"
        errors = self.errors_for("README.md", f"The original creator is Italo Yeltsin. Fabio Sobral is the sole current maintainer. {email}\n")
        self.assertIn("README.md: contains obsolete project contact information", errors)

    def test_generated_and_third_party_exclusions_are_not_checked(self):
        email = "br.yeltsin" + "@gmail.com"
        self.write("resources/maven-metadata.xml", email)
        self.write("vsc-extension-quickstart.md", email)
        self.track()
        self.assertEqual([], governance.validate(self.root))

    def test_itolo_as_current_maintainer_is_rejected(self):
        self.write("AUTHORS.md", f"<!--\n{governance.AMALGAM_COPYRIGHT}\n{governance.APACHE}\n-->\n## Original creator\nItalo Yeltsin\n## Current maintainer\nItalo Yeltsin\n")
        self.track()
        self.assertIn("AUTHORS.md: must identify Fabio Sobral as sole current maintainer", governance.validate(self.root))

    def test_fabio_missing_as_sole_current_maintainer_is_rejected(self):
        self.write("README.md", "The original creator is Italo Yeltsin. Fabio Sobral maintains this.\n")
        self.track()
        self.assertIn("README.md: must identify Fabio Sobral as sole current maintainer", governance.validate(self.root))

    def test_invalid_lockfile_is_rejected(self):
        self.write("package-lock.json", "not json\n")
        self.track()
        self.assertIn("package-lock.json: must be valid JSON", governance.validate(self.root))

    def test_diagnostics_are_sorted(self):
        self.write("src/z.ts", "")
        self.write("src/a.ts", "")
        self.track()
        errors = governance.validate(self.root)
        self.assertEqual(sorted(errors), errors)

    def test_path_with_space_is_validated(self):
        errors = self.errors_for("src/path with space.ts", f"/*\n * {governance.HISTORICAL_COPYRIGHT}\n * {governance.MIT}\n */\n")
        self.assertEqual([], errors)

    def test_shebang_and_xml_declaration_placement(self):
        self.write("test.sh", f"#!/usr/bin/env bash\n# {governance.HISTORICAL_COPYRIGHT}\n# {governance.MIT}\n")
        self.write("resources/template.xml", f"<?xml version=\"1.0\"?>\n<!--\n  {governance.HISTORICAL_COPYRIGHT}\n  {governance.MIT}\n-->\n")
        self.track()
        self.assertEqual([], governance.validate(self.root))


if __name__ == "__main__":
    unittest.main()
