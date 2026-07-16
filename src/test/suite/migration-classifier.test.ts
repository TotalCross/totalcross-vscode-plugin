/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {promises as fs} from 'fs';
import * as os from 'os';
import * as path from 'path';
import {classifyProject} from '../../migration/project-classifier';
import {MIGRATION_REMINDER_DELAY_MS, postponeMigrationReminder, shouldShowMigrationReminder} from '../../migration/reminder-state';

const totalCrossPom = `<?xml version="1.0"?><project><dependencies><dependency><groupId>com.totalcross</groupId><artifactId>totalcross-sdk</artifactId><version>7.3.0</version></dependency></dependencies></project>`;

suite('Maven to Gradle migration classification', () => {
    test('recognizes only an eligible root TotalCross Maven project', async () => {
        const root = await fs.mkdtemp(path.join(os.tmpdir(), 'totalcross-migration-classifier-'));
        try {
            await fs.writeFile(path.join(root, 'pom.xml'), totalCrossPom);
            assert.equal((await classifyProject(root)).kind, 'eligible');
            await fs.writeFile(path.join(root, 'build.gradle'), '');
            assert.equal((await classifyProject(root)).kind, 'gradle-present');
            await fs.unlink(path.join(root, 'build.gradle'));
            await fs.writeFile(path.join(root, 'pom.xml'), '<project><artifactId>ordinary</artifactId></project>');
            assert.equal((await classifyProject(root)).kind, 'non-totalcross-maven');
            await fs.writeFile(path.join(root, 'pom.xml'), '<project>');
            assert.equal((await classifyProject(root)).kind, 'invalid-pom');
        } finally {
            await fs.rmdir(root, {recursive: true});
        }
    });

    test('stores a per-folder deadline for exactly one day', async () => {
        const values: {[key: string]: any} = {};
        const context: any = {workspaceState: {
            get: (key: string) => values[key],
            update: (key: string, value: any) => { values[key] = value; return Promise.resolve(); }
        }};
        const now = 1000;
        await postponeMigrationReminder(context, 'file:///one', now);
        assert.equal(Object.keys(values).length, 1);
        assert.equal(Object.keys(values).map((key) => values[key])[0], now + MIGRATION_REMINDER_DELAY_MS);
        assert.equal(shouldShowMigrationReminder(context, 'file:///one', now + MIGRATION_REMINDER_DELAY_MS - 1), false);
        assert.equal(shouldShowMigrationReminder(context, 'file:///one', now + MIGRATION_REMINDER_DELAY_MS), true);
        assert.equal(shouldShowMigrationReminder(context, 'file:///other', now), true);
    });
});
