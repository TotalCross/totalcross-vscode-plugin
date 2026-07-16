/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {CONVERT_NOW, handleMigrationReminderResponse} from '../../migration/migration-reminder';
import {migrationReminderKey} from '../../migration/reminder-state';

suite('Maven to Gradle migration reminder', () => {
    test('routes Convert Now to the specific workspace folder', async () => {
        let executed: any[] | undefined;
        const folder: any = {uri: {toString: () => 'file:///project'}};
        const context: any = {workspaceState: {get: () => undefined, update: () => Promise.resolve()}};
        await handleMigrationReminderResponse(context, folder, CONVERT_NOW, 10, (command: string, uri: any) => {
            executed = [command, uri];
            return Promise.resolve();
        });
        assert.deepEqual(executed, ['extension.convertMavenProjectToGradle', folder.uri]);
    });

    test('postpones dismissal and the visible reminder action identically', async () => {
        const values: {[key: string]: any} = {};
        const context: any = {workspaceState: {
            get: (key: string) => values[key],
            update: (key: string, value: any) => { values[key] = value; return Promise.resolve(); }
        }};
        const folder: any = {uri: {toString: () => 'file:///project'}};
        await handleMigrationReminderResponse(context, folder, undefined, 99, () => Promise.resolve());
        assert.equal(values[migrationReminderKey('file:///project')], 99 + 86400000);
    });
});
