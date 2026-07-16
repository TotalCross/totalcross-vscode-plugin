/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

export const MIGRATION_REMINDER_DELAY_MS = 24 * 60 * 60 * 1000;

interface WorkspaceState {
    get<T>(section: string): T | undefined;
    update(section: string, value: any): Thenable<void>;
}

interface ReminderContext {
    workspaceState: WorkspaceState;
}

/** Uses the encoded URI so keys cannot collide with similarly named folders. */
export function migrationReminderKey(folderUri: string): string {
    return `totalcross.mavenToGradleReminder.${encodeURIComponent(folderUri)}`;
}

export function shouldShowMigrationReminder(context: ReminderContext, folderUri: string, now: number): boolean {
    const deadline = context.workspaceState.get<number>(migrationReminderKey(folderUri));
    return deadline === undefined || now >= deadline;
}

export function postponeMigrationReminder(context: ReminderContext, folderUri: string, now: number): Thenable<void> {
    return context.workspaceState.update(migrationReminderKey(folderUri), now + MIGRATION_REMINDER_DELAY_MS);
}

export function clearMigrationReminder(context: ReminderContext, folderUri: string): Thenable<void> {
    return context.workspaceState.update(migrationReminderKey(folderUri), undefined);
}
