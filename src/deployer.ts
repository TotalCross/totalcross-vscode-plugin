/*
 * Copyright (C) 2020-2021 TotalCross Global Mobile Platform Ltda.
 * SPDX-License-Identifier: MIT
 */

import * as vscode from 'vscode';
import * as path from 'path';
import {detectProjectLayout, resolveGradleApplicationName} from './project-layout';

const NodeSsh = require('node-ssh');
const validators = require('./validators/deployer');
const fs = require('fs-extra');
const xmlParser = require('xml-js');

async function readPom(pomPath: string): Promise<any> {
    const contents = await fs.readFile(pomPath, 'utf8');
    return JSON.parse(xmlParser.xml2json(contents, {compact: true}));
}

function pomText(value: any): string | undefined {
    return value && typeof value._text === 'string' ? value._text : undefined;
}

function mavenApplicationName(pom: any, fallback: string): string {
    return pomText(pom && pom.project && pom.project.name)
        || pomText(pom && pom.project && pom.project.artifactId)
        || fallback;
}

function quoteForPosixShell(value: string): string {
    return `'${value.replace(/'/g, `'"'"'`)}'`;
}

interface DeploymentResult {
    success: boolean;
    remoteDirectory?: string;
    applicationName?: string;
    username?: string;
    host?: string;
    password?: string;
}

async function deployProject(): Promise<DeploymentResult> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('TotalCross project not found in this VS Code instance.');
        return {success: false};
    }
    const root = workspaceFolders[0].uri.fsPath;
    const layout = await detectProjectLayout(root, process.platform);
    if (!layout) {
        vscode.window.showErrorMessage('No supported TotalCross project found. Expected a Gradle wrapper and build file, or pom.xml.');
        return {success: false};
    }
    if (!(await fs.pathExists(layout.linuxArmInstallDirectory))) {
        vscode.window.showErrorMessage(`TotalCross Linux ARM output was not found at ${layout.linuxArmInstallDirectory}. Run TotalCross: Package (${layout.packageCommand}) before deploying.`);
        return {success: false};
    }

    const fallbackName = path.basename(root);
    let applicationName: string;
    if (layout.buildTool === 'gradle') {
        const resolution = await resolveGradleApplicationName(root, fallbackName);
        applicationName = resolution.name;
        if (resolution.warning) {
            vscode.window.showWarningMessage(resolution.warning);
        }
    } else {
        applicationName = mavenApplicationName(await readPom(path.join(root, 'pom.xml')), fallbackName);
    }

    const username = await vscode.window.showInputBox({prompt: 'ssh user', validateInput: validators.user});
    if (!username) { return {success: false}; }
    const host = await vscode.window.showInputBox({prompt: 'ssh host', validateInput: validators.user});
    if (!host) { return {success: false}; }
    const password = await vscode.window.showInputBox({prompt: 'host password', password: true});
    const remoteDirectory = await vscode.window.showInputBox({
        prompt: 'app host folder',
        value: `/home/${username}/${applicationName}`,
        validateInput: validators.user
    });
    if (!remoteDirectory) { return {success: false}; }

    const options = {
        username,
        host,
        password,
        port: 22,
        tryKeyboard: true,
        onKeyboardInteractive: (_name: any, _instructions: any, _language: any, prompts: any, finish: any) => {
            if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
                finish(vscode.window.showInputBox({prompt: 'password', password: true}));
            }
        }
    };
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Deploying TotalCross Application...'
    }, async () => {
        const ssh = new NodeSsh();
        try {
            await ssh.connect(options);
            const success = await ssh.putDirectory(layout.linuxArmInstallDirectory, remoteDirectory);
            if (success) {
                vscode.window.showInformationMessage('TotalCross Application successfully deployed.');
                return {success, remoteDirectory, applicationName, username, host, password};
            }
            vscode.window.showErrorMessage('Unable to upload the TotalCross application.');
            return {success: false};
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(message);
            return {success: false};
        } finally {
            ssh.dispose();
        }
    });
}

export async function deploy(): Promise<boolean> {
    return (await deployProject()).success;
}

export async function deployAndRun(): Promise<void> {
    const deployment = await deployProject();
    if (!deployment.success || !deployment.remoteDirectory || !deployment.applicationName || !deployment.username || !deployment.host) {
        return;
    }
    const output = vscode.window.createOutputChannel('TotalCross Deploy and Run');
    output.show();
    const ssh = new NodeSsh();
    try {
        await ssh.connect({username: deployment.username, host: deployment.host, password: deployment.password, port: 22});
        const command = `cd -- ${quoteForPosixShell(deployment.remoteDirectory)} && export DISPLAY=:0 && chmod +x -- ${quoteForPosixShell(deployment.applicationName)} && ./${quoteForPosixShell(deployment.applicationName)}`;
        const result = await ssh.execCommand(command, {
            onStdout(chunk: any) {
                output.appendLine(chunk.toString('utf8'));
            },
            onStderr(chunk: any) {
                output.appendLine(chunk.toString('utf8'));
            }
        });
        output.appendLine('exit code: ' + result.code);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(message);
    } finally {
        ssh.dispose();
    }
}
