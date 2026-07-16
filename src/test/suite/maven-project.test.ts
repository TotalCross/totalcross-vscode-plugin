/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {promises as fs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import {renderGradleProject} from '../../migration/gradle-renderer';
import {readMavenTotalCrossProject} from '../../migration/maven-project';

const pom = `<project><parent><groupId>com.example</groupId><version>1.2.3</version></parent><artifactId>demo</artifactId><properties><tc.version>7.3.0</tc.version></properties><repositories><repository><url>http://legacy.example/repo</url></repository></repositories><dependencies><dependency><groupId>com.totalcross</groupId><artifactId>totalcross-sdk</artifactId><version>${'${tc.version}'}</version></dependency></dependencies><build><plugins><plugin><groupId>com.totalcross</groupId><artifactId>totalcross-maven-plugin</artifactId><configuration><name>Demo App</name><platforms><platform>linux_arm</platform><platform>-android</platform></platforms><activationKey>secret</activationKey></configuration></plugin></plugins></build></project>`;

suite('Maven to Gradle project model', () => {
    test('reads inherited coordinates, properties, and TotalCross configuration', async () => {
        const root = await fs.mkdtemp(path.join(os.tmpdir(), 'totalcross-maven-model-'));
        try {
            const pomPath = path.join(root, 'pom.xml');
            await fs.writeFile(pomPath, pom);
            const project = await readMavenTotalCrossProject(pomPath);
            assert.equal(project.groupId, 'com.example');
            assert.equal(project.version, '1.2.3');
            assert.equal(project.sdkVersion, '7.3.0');
            assert.deepEqual(project.platforms, ['linux_arm', '-android']);
            const rendered = renderGradleProject(project, '0.1.0-SNAPSHOT');
            const build = String(rendered.files.get('build.gradle'));
            assert.ok(build.includes("allowInsecureProtocol = true"));
            assert.ok(build.includes("activationKey = providers.gradleProperty('totalcrossActivationKey').orNull"));
            assert.equal(build.includes('secret'), false);
            assert.equal(String(rendered.files.get('.totalcross/project.json')).includes('secret'), false);
            assert.ok(rendered.files.get('gradle/wrapper/gradle-wrapper.jar') instanceof Buffer);
            assert.deepEqual(rendered.sensitiveFiles, ['gradle.properties']);
        } finally {
            await fs.rmdir(root, {recursive: true});
        }
    });

    test('rejects unresolved and ambiguous SDK versions', async () => {
        const root = await fs.mkdtemp(path.join(os.tmpdir(), 'totalcross-maven-invalid-'));
        try {
            const pomPath = path.join(root, 'pom.xml');
            await fs.writeFile(pomPath, pom.replace('${tc.version}', '${missing}'));
            await assert.rejects(readMavenTotalCrossProject(pomPath), /Unable to resolve TotalCross SDK version/);
            await fs.writeFile(pomPath, pom.replace('</dependencies>', '<dependency><groupId>com.totalcross</groupId><artifactId>totalcross-sdk</artifactId><version>7.2.2</version></dependency></dependencies>'));
            await assert.rejects(readMavenTotalCrossProject(pomPath), /more than one/);
        } finally {
            await fs.rmdir(root, {recursive: true});
        }
    });
});
