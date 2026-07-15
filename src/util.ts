/*
 * Copyright (C) 2020-2021 TotalCross Global Mobile Platform Ltda.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra');
const envPaths = require('env-paths');
const paths = envPaths('TotalCross', {suffix: null});


export function getTotalCrossConfigHomePath() : string{
    return paths.config;
}
