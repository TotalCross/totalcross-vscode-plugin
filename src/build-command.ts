/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import {BuildTool} from './project-layout';

/** Returns the command that packages a project without changing its working directory. */
export function packageCommand(buildTool: BuildTool, platform: NodeJS.Platform): string {
    if (buildTool === 'maven') {
        return 'mvn package';
    }
    return platform === 'win32' ? 'gradlew.bat totalcrossPackage' : './gradlew totalcrossPackage';
}
