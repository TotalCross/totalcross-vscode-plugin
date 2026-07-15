/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as https from 'https';

const fs = require('fs-extra');
const xmlParser = require('xml-js');

const TOTALCROSS_SDK_METADATA_URL = 'https://maven.totalcross.com/artifactory/repo1/com/totalcross/totalcross-sdk/maven-metadata.xml';
const TOTALCROSS_MAVEN_PLUGIN_METADATA_URL = 'https://maven.totalcross.com/artifactory/repo1/com/totalcross/totalcross-maven-plugin/maven-metadata.xml';

export function metadataVersions(metadata: string): string[] {
    const document = JSON.parse(xmlParser.xml2json(metadata, {compact: true}));
    const versionNodes = document.metadata.versioning.versions.version;
    const nodes = Array.isArray(versionNodes) ? versionNodes : [versionNodes];
    return nodes
        .map((version: any) => version._text)
        .filter((version: any) => typeof version === 'string')
        .sort()
        .reverse();
}

export function latestVersionForEachMajor(versions: string[]): string[] {
    return versions.filter((version, index) => index === 0 || version.split('.')[0] !== versions[index - 1].split('.')[0]);
}

function downloadText(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            if (!response.statusCode || response.statusCode >= 300) {
                response.resume();
                reject(new Error(`Unable to download Maven metadata: HTTP ${response.statusCode || 'unknown'}`));
                return;
            }
            let contents = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => contents += chunk);
            response.on('end', () => resolve(contents));
        });
        request.setTimeout(10000, () => request.destroy(new Error('Timed out downloading Maven metadata')));
        request.on('error', reject);
    });
}

export async function latestTotalCrossSdkVersions(cachedMetadataPath: string): Promise<string[]> {
    try {
        return latestVersionForEachMajor(metadataVersions(await downloadText(TOTALCROSS_SDK_METADATA_URL)));
    } catch (_) {
        return latestVersionForEachMajor(metadataVersions(await fs.readFile(cachedMetadataPath, 'utf8')));
    }
}

export async function latestMavenPluginVersion(): Promise<string> {
    return metadataVersions(await downloadText(TOTALCROSS_MAVEN_PLUGIN_METADATA_URL))[0];
}
