/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import {spawn} from 'child_process';
import {promises as fs} from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {GENERATED_GRADLE_MARKER, RenderedGradleProject, renderGradleProject} from './gradle-renderer';
import {readMavenTotalCrossProject} from './maven-project';
import {classifyProject} from './project-classifier';
import {clearMigrationReminder} from './reminder-state';

export interface ConversionResult {
    status: 'converted' | 'plugin-not-local' | 'already-gradle' | 'unsupported' | 'failed';
    message: string;
    details?: string;
}

type Validator = () => Promise<void>;
const BACKUP_DIRECTORY = '.totalcross-migration-backup';

async function exists(file: string): Promise<boolean> {
    try { await fs.access(file); return true; } catch (_) { return false; }
}

/** `fs.promises.rm` is newer than this extension's declared Node type baseline. */
async function removeTree(directory: string): Promise<void> {
    try { await fs.rmdir(directory, {recursive: true}); } catch (_) { /* Already absent. */ }
}

async function writeAtomic(file: string, contents: Buffer | string): Promise<void> {
    await fs.mkdir(path.dirname(file), {recursive: true});
    const temporary = `${file}.totalcross-tmp-${process.pid}`;
    await fs.writeFile(temporary, contents);
    await fs.rename(temporary, file);
}

async function copyToBackup(root: string, backup: string, relative: string): Promise<boolean> {
    const source = path.join(root, relative);
    if (!(await exists(source))) {
        return false;
    }
    const destination = path.join(backup, relative);
    await fs.mkdir(path.dirname(destination), {recursive: true});
    await fs.copyFile(source, destination);
    return true;
}

async function restore(root: string, backup: string, originalFiles: Set<string>, writtenFiles: string[]): Promise<void> {
    for (const relative of writtenFiles) {
        const destination = path.join(root, relative);
        if (originalFiles.has(relative)) {
            await fs.mkdir(path.dirname(destination), {recursive: true});
            await fs.copyFile(path.join(backup, relative), destination);
        } else {
            try { await fs.unlink(destination); } catch (_) { /* It was not written. */ }
        }
    }
}

async function nextPomBackup(root: string): Promise<string> {
    let suffix = '.maven-backup';
    for (let number = 1; await exists(path.join(root, `pom.xml${suffix}`)); number++) {
        suffix = `.maven-backup.${number}`;
    }
    return path.join(root, `pom.xml${suffix}`);
}

async function mergeGitIgnore(root: string): Promise<string | undefined> {
    const file = path.join(root, '.gitignore');
    const existing = (await exists(file)) ? await fs.readFile(file, 'utf8') : '';
    const additions = ['gradle.properties', `${BACKUP_DIRECTORY}/`].filter((entry) => existing.split(/\r?\n/).indexOf(entry) === -1);
    return additions.length ? `${existing}${existing && !existing.endsWith('\n') ? '\n' : ''}${additions.join('\n')}\n` : undefined;
}

function isMissingLocalPlugin(error: Error): boolean {
    return /com\.totalcross\.application|com\.totalcross\.application\.gradle\.plugin/i.test(error.message)
        && /(not found|could not resolve|could not find|unknown plugin)/i.test(error.message);
}

function runWrapper(root: string): Promise<void> {
    const command = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    return new Promise((resolve, reject) => {
        const child = spawn(command, ['tasks', '--console=plain'], {cwd: root, shell: false});
        let output = '';
        child.stdout.on('data', (chunk) => output += chunk.toString());
        child.stderr.on('data', (chunk) => output += chunk.toString());
        child.on('error', (error) => reject(error));
        child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Gradle Wrapper exited with ${code}.\n${output}`)));
    });
}

/** Performs file writes atomically and restores pre-existing files after any ordinary validation failure. */
export async function writeAndValidateGradleProject(root: string, rendered: RenderedGradleProject, validate: Validator): Promise<'converted' | 'plugin-not-local'> {
    const backup = path.join(root, BACKUP_DIRECTORY);
    await removeTree(backup);
    await fs.mkdir(backup, {recursive: true});
    const files = new Map(rendered.files);
    const mergedIgnore = await mergeGitIgnore(root);
    if (mergedIgnore !== undefined) { files.set('.gitignore', mergedIgnore); }
    const gradleProperties = files.get('gradle.properties');
    if (typeof gradleProperties === 'string' && await exists(path.join(root, 'gradle.properties'))) {
        const existing = await fs.readFile(path.join(root, 'gradle.properties'), 'utf8');
        const activation = gradleProperties.trim();
        files.set('gradle.properties', /^totalcrossActivationKey=.*$/m.test(existing)
            ? existing.replace(/^totalcrossActivationKey=.*$/m, activation)
            : `${existing}${existing && !existing.endsWith('\n') ? '\n' : ''}${activation}\n`);
    }
    const written = Array.from(files.keys());
    const originals = new Set<string>();
    try {
        for (const relative of written) {
            if (await copyToBackup(root, backup, relative)) { originals.add(relative); }
        }
        for (const relative of written) {
            await writeAtomic(path.join(root, relative), files.get(relative)!);
        }
        if (process.platform !== 'win32') {
            const wrapper = path.join(root, 'gradlew');
            if (await exists(wrapper)) {
                await fs.chmod(wrapper, (await fs.stat(wrapper)).mode | 0o111);
            }
        }
        await validate();
        await fs.rename(path.join(root, 'pom.xml'), await nextPomBackup(root));
        await removeTree(backup);
        return 'converted';
    } catch (error) {
        const failure = error instanceof Error ? error : new Error(String(error));
        if (isMissingLocalPlugin(failure)) {
            await removeTree(backup);
            return 'plugin-not-local';
        }
        await restore(root, backup, originals, written);
        await removeTree(backup);
        throw failure;
    }
}

async function generatedMigrationBuild(root: string): Promise<boolean> {
    try {
        return (await fs.readFile(path.join(root, 'build.gradle'), 'utf8')).indexOf(GENERATED_GRADLE_MARKER) !== -1;
    } catch (_) {
        return false;
    }
}

/** Converts one explicitly selected workspace folder and never invokes a shell with its path. */
export async function convertMavenProjectToGradle(context: vscode.ExtensionContext, folder: vscode.WorkspaceFolder): Promise<ConversionResult> {
    const output = vscode.window.createOutputChannel('TotalCross Migration');
    const root = folder.uri.fsPath;
    try {
        const classification = await classifyProject(root);
        if (classification.kind === 'gradle-present' && !(await generatedMigrationBuild(root))) {
            const result = {status: 'already-gradle' as 'already-gradle', message: 'This project already contains a Gradle build. No conversion was performed.'};
            vscode.window.showInformationMessage(result.message);
            return result;
        }
        if (classification.kind !== 'eligible' && classification.kind !== 'gradle-present') {
            const result = {status: 'unsupported' as 'unsupported', message: 'This workspace is not a supported TotalCross Maven project.'};
            vscode.window.showErrorMessage(result.message);
            return result;
        }
        const project = await readMavenTotalCrossProject(path.join(root, 'pom.xml'));
        const pluginVersion = vscode.workspace.getConfiguration('totalcross').get<string>('gradlePluginVersion', '0.1.0-SNAPSHOT');
        const rendered = renderGradleProject(project, pluginVersion);
        const status = await vscode.window.withProgress({location: vscode.ProgressLocation.Notification, title: 'Converting TotalCross project to Gradle...'}, () => writeAndValidateGradleProject(root, rendered, () => runWrapper(root)));
        if (status === 'plugin-not-local') {
            const result = {status, message: 'The Gradle files were created, but the TotalCross Gradle plugin is not available in Maven Local. Run `./gradlew publishToMavenLocal` in the totalcross-gradle-plugin repository, then run the conversion command again.'};
            vscode.window.showErrorMessage(result.message);
            return result;
        }
        await clearMigrationReminder(context, folder.uri.toString());
        const result = {status, message: 'The TotalCross project was converted to Gradle successfully.'};
        vscode.window.showInformationMessage(result.message);
        return result;
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        output.appendLine(details);
        output.show(true);
        const result = {status: 'failed' as 'failed', message: `Unable to convert the TotalCross project: ${details}`, details};
        vscode.window.showErrorMessage(result.message);
        return result;
    }
}
