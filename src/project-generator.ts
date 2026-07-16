/*
 * Copyright (C) 2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import {promises as fs} from 'fs';
import * as path from 'path';

export interface TotalCrossProjectOptions {
    groupId: string;
    artifactId: string;
    sdkVersion: string;
    platforms: string[];
    activationKey?: string;
    gradlePluginVersion: string;
}

const SUPPORTED_PLATFORMS = ['android', 'ios', 'linux', 'linux_arm', 'win32', 'wince'];
const PLACEHOLDER = /\$\{'(groupid|artifactid|version|platforms|activation_key|gradle_plugin_version|java_release)'\}/g;
const UNREPLACED_PLACEHOLDER = /\$\{'(groupid|artifactid|version|platforms|activation_key|gradle_plugin_version|java_release)'\}/;

function validateOptions(options: TotalCrossProjectOptions): void {
    if (!/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/.test(options.groupId)) {
        throw new Error('The project group ID is not a valid Java package name.');
    }
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(options.artifactId)) {
        throw new Error('The project artifact ID must start with a letter and contain only letters, numbers, and underscores.');
    }
    if (!options.platforms.length || options.platforms.some((platform) => SUPPORTED_PLATFORMS.indexOf(platform) === -1)) {
        throw new Error(`Select at least one supported TotalCross platform: ${SUPPORTED_PLATFORMS.join(', ')}.`);
    }
    if (!options.gradlePluginVersion) {
        throw new Error('A TotalCross Gradle plugin version is required.');
    }
    javaReleaseForSdk(options.sdkVersion);
}

/** Chooses the source release accepted by the corresponding TotalCross SDK. */
export function javaReleaseForSdk(version: string): number {
    const match = /^(\d+)\.(\d+)\.(\d+)(?:[.-].*)?$/.exec(version);
    if (!match) {
        throw new Error(`TotalCross SDK version must use major.minor.patch format: ${version}`);
    }
    const major = Number(match[1]);
    const minor = Number(match[2]);
    const patch = Number(match[3]);
    return major > 7 || (major === 7 && (minor > 3 || (minor === 3 && patch >= 0))) ? 17 : 8;
}

export function renderPlatforms(platforms: string[]): string {
    return platforms.map((platform) => `'${platform}'`).join(', ');
}

/** Renders a UTF-8 template in memory and rejects any known unresolved token. */
export function renderTemplate(template: string, options: TotalCrossProjectOptions): string {
    const replacements: {[key: string]: string} = {
        groupid: options.groupId,
        artifactid: options.artifactId,
        version: options.sdkVersion,
        platforms: renderPlatforms(options.platforms),
        activation_key: options.activationKey || '',
        gradle_plugin_version: options.gradlePluginVersion,
        java_release: String(javaReleaseForSdk(options.sdkVersion))
    };
    const rendered = template.replace(PLACEHOLDER, (_, key) => replacements[key]);
    if (UNREPLACED_PLACEHOLDER.test(rendered)) {
        throw new Error('Generated project contains an unreplaced template placeholder.');
    }
    return rendered;
}

async function writeText(destination: string, contents: string): Promise<void> {
    await fs.mkdir(path.dirname(destination), {recursive: true});
    const temporary = `${destination}.totalcross-tmp-${process.pid}`;
    await fs.writeFile(temporary, contents, 'utf8');
    await fs.rename(temporary, destination);
}

async function copyTree(templateRoot: string, destinationRoot: string, options: TotalCrossProjectOptions, relative = ''): Promise<void> {
    const sourceDirectory = path.join(templateRoot, relative);
    const entries = await fs.readdir(sourceDirectory, {withFileTypes: true});
    for (const entry of entries) {
        const entryRelative = path.join(relative, entry.name);
        if (entry.isDirectory()) {
            await copyTree(templateRoot, destinationRoot, options, entryRelative);
            continue;
        }
        if (entryRelative === path.join('src', 'main', 'java', 'Artifact.java.template')) {
            continue;
        }
        const source = path.join(templateRoot, entryRelative);
        const destination = path.join(destinationRoot, relative, entry.name.replace(/\.template$/, ''));
        await fs.mkdir(path.dirname(destination), {recursive: true});
        if (entry.name.endsWith('.template')) {
            await writeText(destination, renderTemplate(await fs.readFile(source, 'utf8'), options));
        } else {
            await fs.copyFile(source, destination);
            if (entry.name === 'gradlew') {
                const mode = (await fs.stat(destination)).mode;
                await fs.chmod(destination, mode | 0o111);
            }
        }
    }
}

/** Copies a complete Gradle project template into an empty destination directory. */
export async function generateGradleProject(templateRoot: string, destinationRoot: string, options: TotalCrossProjectOptions): Promise<void> {
    validateOptions(options);
    await fs.mkdir(destinationRoot, {recursive: true});
    if ((await fs.readdir(destinationRoot)).length) {
        throw new Error('Select an empty folder for the new TotalCross project.');
    }
    await copyTree(templateRoot, destinationRoot, options);
    const source = await fs.readFile(path.join(templateRoot, 'src', 'main', 'java', 'Artifact.java.template'), 'utf8');
    const javaDestination = path.join(destinationRoot, 'src', 'main', 'java', ...options.groupId.split('.'), `${options.artifactId}.java`);
    await writeText(javaDestination, renderTemplate(source, options));
}
