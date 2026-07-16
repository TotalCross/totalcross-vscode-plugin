/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode';

export interface ConversionResult {
    status: 'converted' | 'plugin-not-local' | 'already-gradle' | 'unsupported' | 'failed';
    message: string;
    details?: string;
}

/**
 * The transaction is implemented in the next migration milestone.  This narrow
 * command boundary lets reminder actions always identify their target folder.
 */
export async function convertMavenProjectToGradle(_context: vscode.ExtensionContext, _folder: vscode.WorkspaceFolder): Promise<ConversionResult> {
    const result = {status: 'unsupported' as 'unsupported', message: 'Maven-to-Gradle conversion is not available yet.'};
    vscode.window.showErrorMessage(result.message);
    return result;
}
