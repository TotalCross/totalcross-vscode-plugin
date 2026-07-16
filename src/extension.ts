/*
 * Copyright (C) 2020-2021 TotalCross Global Mobile Platform Ltda.
 * SPDX-License-Identifier: MIT
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {createNewProject} from './creator';
import {deploy, deployAndRun} from './deployer';
import {packageProject} from './packager';
import {ConfigChecker} from './config-checker';
import {showMigrationReminderIfNeeded} from './migration/migration-reminder';
import {convertMavenProjectToGradle} from './migration/convert-project';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	new ConfigChecker().checkConfigFile();
	showMigrationReminderIfNeeded(context).catch((error) => console.error('Unable to show TotalCross migration reminder:', error));
	/**
	 * Create new Project
	 */
	let disposable = vscode.commands.registerCommand('extension.createNewProject', function() {
		createNewProject(context);
	});
	context.subscriptions.push(disposable);
	
	/**
	 * Package
	 */
	disposable = vscode.commands.registerCommand('extension.package', packageProject);
	context.subscriptions.push(disposable);

	/**
	 * Deploy 
	 */
	disposable = vscode.commands.registerCommand('extension.deploy', deploy);
	context.subscriptions.push(disposable);

	/**
	 * Deploy and Run
	 */
	disposable = vscode.commands.registerCommand('extension.deployAndRun', deployAndRun);
	context.subscriptions.push(disposable);

	/** Convert a specifically selected legacy workspace folder, including command-palette retries. */
	disposable = vscode.commands.registerCommand('extension.convertMavenProjectToGradle', async (uri?: vscode.Uri) => {
		const folder = uri ? vscode.workspace.getWorkspaceFolder(uri) : (vscode.workspace.workspaceFolders || [])[0];
		if (!folder) {
			vscode.window.showErrorMessage('TotalCross project not found in this VS Code instance.');
			return;
		}
		await convertMavenProjectToGradle(context, folder);
	});
	context.subscriptions.push(disposable);

}

// this method is called when your extension is deactivated
export function deactivate() {}
