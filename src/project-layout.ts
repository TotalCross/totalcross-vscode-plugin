/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import {promises as fs} from 'fs';
import * as path from 'path';
import {packageCommand} from './build-command';

export type BuildTool = 'gradle' | 'maven';

export interface ProjectLayout {
    buildTool: BuildTool;
    root: string;
    packageCommand: string;
    packageOutputRoot: string;
    linuxArmInstallDirectory: string;
}

const GRADLE_BUILD_FILES = ['settings.gradle', 'settings.gradle.kts', 'build.gradle', 'build.gradle.kts'];

async function exists(file: string): Promise<boolean> {
    try {
        await fs.access(file);
        return true;
    } catch (_) {
        return false;
    }
}

export function layoutFor(buildTool: BuildTool, root: string, platform: NodeJS.Platform): ProjectLayout {
    const outputRoot = buildTool === 'gradle'
        ? path.join(root, 'build', 'totalcross')
        : path.join(root, 'target');
    return {
        buildTool,
        root,
        packageCommand: packageCommand(buildTool, platform),
        packageOutputRoot: outputRoot,
        linuxArmInstallDirectory: buildTool === 'gradle'
            ? path.join(outputRoot, 'install', 'linux_arm')
            : path.join(outputRoot, 'install', 'linux_arm')
    };
}

/** Detects a Gradle project before Maven so mixed workspaces use the new workflow. */
export async function detectProjectLayout(root: string, platform: NodeJS.Platform): Promise<ProjectLayout | undefined> {
    const hasWrapper = await exists(path.join(root, 'gradlew')) || await exists(path.join(root, 'gradlew.bat'));
    const hasGradleBuild = (await Promise.all(GRADLE_BUILD_FILES.map((file) => exists(path.join(root, file))))).some(Boolean);
    if (hasWrapper && hasGradleBuild) {
        return layoutFor('gradle', root, platform);
    }
    if (await exists(path.join(root, 'pom.xml'))) {
        return layoutFor('maven', root, platform);
    }
    return undefined;
}

export function applicationNameFromGradle(text: string): string | undefined {
    const match = /(?:^|\n)\s*applicationName\s*=\s*['\"]([^'\"]+)['\"]/m.exec(text);
    return match ? match[1] : undefined;
}

export function projectNameFromSettings(text: string): string | undefined {
    const match = /(?:^|\n)\s*rootProject\.name\s*=\s*['\"]([^'\"]+)['\"]/m.exec(text);
    return match ? match[1] : undefined;
}

export interface ApplicationNameResolution {
    name: string;
    warning?: string;
}

/** Reads only the generator's simple string assignments; it never evaluates a Gradle script. */
export async function resolveGradleApplicationName(root: string, fallback: string): Promise<ApplicationNameResolution> {
    for (const file of ['build.gradle', 'settings.gradle']) {
        try {
            const contents = await fs.readFile(path.join(root, file), 'utf8');
            const name = file === 'build.gradle'
                ? applicationNameFromGradle(contents)
                : projectNameFromSettings(contents);
            if (name) {
                return {name};
            }
        } catch (_) {
            // A Kotlin build or a missing file is handled by the documented fallback.
        }
    }
    return {
        name: fallback,
        warning: `Unable to find a simple Gradle application name; using workspace folder name '${fallback}'.`
    };
}
