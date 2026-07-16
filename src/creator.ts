/*
 * Copyright (C) 2020-2021 TotalCross Global Mobile Platform Ltda.
 * SPDX-License-Identifier: MIT
 */

import * as vscode from 'vscode';
import {showInputBox} from './components/components';
import {latestTotalCrossSdkVersions} from './maven-metadata';
import {generateGradleProject} from './project-generator';
import * as path from 'path';

const validators = require('./validators/creator');
const DEFAULT_ACTIVATION_KEY = '5443444B5AAEEB90306B00E4';

const options: vscode.OpenDialogOptions = {
    canSelectMany: false,
    canSelectFiles: false,
    canSelectFolders: true,
    openLabel: 'Select Project Folder'
};

export async function createNewProject(context: vscode.ExtensionContext): Promise<void> {
   let file = await vscode.window.showOpenDialog(options);
    if(file === undefined) {return;}
    
    // Get Project Information
    
    let groupID = await showInputBox(
        'Enter project GroupId',
        'example: com.totalcross',
        validators.groupId
        );
    if(!groupID) {return;}
    let artifactID = await showInputBox(
        'Enter project ArtifactId',
        'example: MyFirstApp', 
        validators.artifactId
        );
    if(!artifactID) {return;}
    let availableVersions = await latestTotalCrossSdkVersions(`${context.extensionPath}/resources/maven-metadata.xml`);
    let version = await vscode.window.showQuickPick(availableVersions, {
        placeHolder: 'totalcross sdk version',
        ignoreFocusOut: true

    });
    if(!version) {return;}
    let platforms = await vscode.window.showQuickPick (
        ['android', 'ios', 'linux', 'linux_arm', 'win32', 'wince'],
        {
            canPickMany: true,
            placeHolder: 'example: linux_arm',
            ignoreFocusOut: true
        }
    );
    if(!platforms || !platforms.length) {return;}
    
    const activationKey = DEFAULT_ACTIVATION_KEY;
    const gradlePluginVersion = vscode.workspace.getConfiguration('totalcross')
        .get<string>('gradlePluginVersion', '0.1.0-SNAPSHOT');
    const destination = file[0].fsPath;
    try {
        await generateGradleProject(path.join(context.extensionPath, 'resources', 'gradle'), destination, {
            groupId: groupID,
            artifactId: artifactID,
            sdkVersion: version,
            platforms,
            activationKey,
            gradlePluginVersion
        });
        await vscode.commands.executeCommand('vscode.openFolder', file[0]);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Unable to create TotalCross Gradle project: ${message}`);
        console.error(error);
    }
}
