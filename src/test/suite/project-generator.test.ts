/*
 * Copyright (C) 2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {promises as fs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import {generateGradleProject, javaReleaseForSdk, renderPlatforms, renderTemplate} from '../../project-generator';

const templateRoot = path.resolve(__dirname, '../../../resources/gradle');

suite('Gradle project generator', () => {
    test('renders platforms and applies the SDK Java compatibility policy', () => {
        assert.equal(renderPlatforms(['android', 'linux_arm']), "'android', 'linux_arm'");
        assert.equal(javaReleaseForSdk('7.2.2'), 8);
        assert.equal(javaReleaseForSdk('7.3.0'), 17);
        assert.throws(() => javaReleaseForSdk('7.3'));
    });

    test('renders every known placeholder', () => {
        const rendered = renderTemplate("${'groupid'} ${'artifactid'} ${'version'} ${'platforms'} ${'activation_key'} ${'gradle_plugin_version'} ${'java_release'}", {
            groupId: 'com.example', artifactId: 'Demo', sdkVersion: '7.3.0', platforms: ['linux'],
            activationKey: 'key', gradlePluginVersion: '0.1.0-SNAPSHOT'
        });
        assert.equal(rendered, "com.example Demo 7.3.0 'linux' key 0.1.0-SNAPSHOT 17");
    });

    test('creates a complete Gradle project without Maven files', async () => {
        const destination = await fs.mkdtemp(path.join(os.tmpdir(), 'totalcross-vscode-generator-'));
        try {
            await generateGradleProject(templateRoot, destination, {
                groupId: 'com.example.demo', artifactId: 'Demo', sdkVersion: '7.2.2',
                platforms: ['android', 'linux_arm'], activationKey: 'test-key', gradlePluginVersion: '0.1.0-SNAPSHOT'
            });
            const build = await fs.readFile(path.join(destination, 'build.gradle'), 'utf8');
            assert.ok(build.includes("id 'com.totalcross.application' version '0.1.0-SNAPSHOT'"));
            assert.ok(build.includes("platforms = ['android', 'linux_arm']"));
            assert.ok(build.includes('options.release = 8'));
            assert.equal(await fileExists(path.join(destination, 'pom.xml')), false);
            assert.equal(await fileExists(path.join(destination, 'gradle', 'wrapper', 'gradle-wrapper.jar')), true);
            assert.equal((await fs.stat(path.join(destination, 'gradlew'))).mode & 0o111, 0o111);
            const source = await fs.readFile(path.join(destination, 'src', 'main', 'java', 'com', 'example', 'demo', 'Demo.java'), 'utf8');
            assert.ok(source.includes('package com.example.demo;'));
            assert.equal(build.includes("${'groupid'}"), false);
        } finally {
            await fs.rmdir(destination, {recursive: true});
        }
    });
});

async function fileExists(file: string): Promise<boolean> {
    try {
        await fs.access(file);
        return true;
    } catch (_) {
        return false;
    }
}
