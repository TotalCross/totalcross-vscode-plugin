/*
 * Copyright (C) 2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {promises as fs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import {packageCommand} from '../../build-command';
import {applicationNameFromGradle, detectProjectLayout, layoutFor, projectNameFromSettings, resolveGradleApplicationName} from '../../project-layout';

suite('Project layout', () => {
    test('selects Gradle wrapper commands by platform and preserves Maven compatibility', () => {
        assert.equal(packageCommand('gradle', 'darwin'), './gradlew totalcrossPackage');
        assert.equal(packageCommand('gradle', 'win32'), 'gradlew.bat totalcrossPackage');
        assert.equal(packageCommand('maven', 'darwin'), 'mvn package');
        const gradle = layoutFor('gradle', '/project', 'linux');
        const maven = layoutFor('maven', '/project', 'linux');
        assert.equal(gradle.linuxArmInstallDirectory, path.join('/project', 'build', 'totalcross', 'install', 'linux_arm'));
        assert.equal(maven.linuxArmInstallDirectory, path.join('/project', 'target', 'install', 'linux_arm'));
    });

    test('prefers Gradle when both layouts are present', async () => {
        const root = await fs.mkdtemp(path.join(os.tmpdir(), 'totalcross-vscode-layout-'));
        try {
            await Promise.all([
                fs.writeFile(path.join(root, 'gradlew'), ''), fs.writeFile(path.join(root, 'settings.gradle'), ''),
                fs.writeFile(path.join(root, 'pom.xml'), '')
            ]);
            const layout = await detectProjectLayout(root, 'darwin');
            assert.ok(layout);
            assert.equal(layout && layout.buildTool, 'gradle');
        } finally {
            await fs.rmdir(root, {recursive: true});
        }
    });

    test('uses only simple generated Gradle assignments for deployment identity', async () => {
        assert.equal(applicationNameFromGradle("totalcross {\n applicationName = 'Demo'\n}"), 'Demo');
        assert.equal(projectNameFromSettings("rootProject.name = 'Sample'"), 'Sample');
        const root = await fs.mkdtemp(path.join(os.tmpdir(), 'totalcross-vscode-name-'));
        try {
            await fs.writeFile(path.join(root, 'settings.gradle'), "rootProject.name = 'Sample'");
            assert.deepEqual(await resolveGradleApplicationName(root, 'fallback'), {name: 'Sample'});
        } finally {
            await fs.rmdir(root, {recursive: true});
        }
    });
});
