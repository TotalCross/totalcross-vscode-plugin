/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode';
import {classifyProject} from './project-classifier';
import {postponeMigrationReminder, shouldShowMigrationReminder} from './reminder-state';

export const CONVERT_NOW = 'Convert Now';
export const REMIND_TOMORROW = 'Remind Me Tomorrow';
export const MIGRATION_MESSAGE = 'This TotalCross project uses Maven. Convert it to Gradle to use the TotalCross Gradle plugin?';

interface CommandExecutor {
    (command: string, ...rest: any[]): Thenable<any>;
}

/** Handles a selected action; dismissal deliberately has the same one-day delay as postponement. */
export async function handleMigrationReminderResponse(
    context: vscode.ExtensionContext,
    folder: vscode.WorkspaceFolder,
    response: string | undefined,
    now: number,
    executeCommand: CommandExecutor
): Promise<void> {
    if (response === CONVERT_NOW) {
        await executeCommand('extension.convertMavenProjectToGradle', folder.uri);
        return;
    }
    await postponeMigrationReminder(context, folder.uri.toString(), now);
}

/** Shows at most one actionable recommendation during an extension activation. */
export async function showMigrationReminderIfNeeded(
    context: vscode.ExtensionContext,
    now: () => number = Date.now
): Promise<void> {
    const folders = vscode.workspace.workspaceFolders || [];
    for (const folder of folders) {
        const timestamp = now();
        if (!shouldShowMigrationReminder(context, folder.uri.toString(), timestamp)) {
            continue;
        }
        let classification;
        try {
            classification = await classifyProject(folder.uri.fsPath);
        } catch (error) {
            console.error('Unable to classify TotalCross Maven project:', error);
            continue;
        }
        if (classification.kind === 'invalid-pom') {
            const invalid = classification as {kind: 'invalid-pom'; error: Error};
            console.error(`Unable to parse ${folder.uri.fsPath}/pom.xml:`, invalid.error);
            continue;
        }
        if (classification.kind !== 'eligible') {
            continue;
        }
        const message = folders.length > 1 ? `${MIGRATION_MESSAGE} (${folder.name})` : MIGRATION_MESSAGE;
        const response = await vscode.window.showInformationMessage(message, CONVERT_NOW, REMIND_TOMORROW);
        await handleMigrationReminderResponse(context, folder, response, timestamp, vscode.commands.executeCommand);
        return;
    }
}
