/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import {promises as fs} from 'fs';

const xmlParser = require('xml-js');

export interface MavenTotalCrossProject {
    groupId?: string;
    artifactId: string;
    version?: string;
    applicationName: string;
    sdkVersion: string;
    platforms: string[];
    activationKey?: string;
    certificates?: string;
    totalcrossHome?: string;
    javaRelease?: number;
    repositories: string[];
}

function list(value: any): any[] {
    return value === undefined || value === null ? [] : Array.isArray(value) ? value : [value];
}

function rawText(value: any): string | undefined {
    return value && typeof value._text === 'string' ? value._text.trim() : undefined;
}

function coordinate(entries: any[], groupId: string, artifactId: string): any | undefined {
    return entries.filter((entry) => rawText(entry && entry.groupId) === groupId && rawText(entry && entry.artifactId) === artifactId)[0];
}

function propertyValues(project: any): {[key: string]: string} {
    const values: {[key: string]: string} = {};
    const properties = project.properties || {};
    Object.keys(properties).forEach((key) => {
        const value = rawText(properties[key]);
        if (value !== undefined) {
            values[key] = value;
        }
    });
    return values;
}

function resolve(value: string | undefined, properties: {[key: string]: string}, known: {[key: string]: string | undefined}, field: string): string | undefined {
    if (value === undefined || value === '') {
        return undefined;
    }
    let resolved = value;
    for (let attempts = 0; attempts < 10; attempts++) {
        const match = /\$\{([^}]+)\}/.exec(resolved);
        if (!match) {
            return resolved;
        }
        const replacement = properties[match[1]] !== undefined ? properties[match[1]] : known[match[1]];
        if (replacement === undefined) {
            throw new Error(`Unable to resolve ${field}: ${match[0]}`);
        }
        resolved = resolved.replace(match[0], replacement);
    }
    throw new Error(`Unable to resolve ${field}: property expansion is recursive.`);
}

function configurationValue(configuration: any, name: string): string | undefined {
    return rawText(configuration && configuration[name]);
}

function platformValues(configuration: any, properties: {[key: string]: string}, known: {[key: string]: string | undefined}): string[] {
    const container = configuration && (configuration.platforms || configuration.targets);
    const candidates = container ? list(container.platform || container.target || container._text) : list(configuration && configuration.platform);
    return candidates.map((entry) => resolve(typeof entry === 'string' ? entry : rawText(entry), properties, known, 'TotalCross platform')).filter((value): value is string => !!value);
}

function javaRelease(project: any, properties: {[key: string]: string}, known: {[key: string]: string | undefined}): number | undefined {
    const value = rawText(project.properties && (project.properties['maven.compiler.release'] || project.properties['maven.compiler.target'] || project.properties['maven.compiler.source']));
    const resolved = resolve(value, properties, known, 'Java release');
    if (!resolved) {
        return undefined;
    }
    const number = Number(resolved.replace(/^1\./, ''));
    return isFinite(number) ? number : undefined;
}

/** Converts a supported Maven POM into the deliberately small model needed by the Gradle templates. */
export async function readMavenTotalCrossProject(pomPath: string): Promise<MavenTotalCrossProject> {
    const document = JSON.parse(xmlParser.xml2json(await fs.readFile(pomPath, 'utf8'), {compact: true}));
    const project = document && document.project;
    if (!project) {
        throw new Error('The Maven POM does not contain a project element.');
    }
    const properties = propertyValues(project);
    const parent = project.parent || {};
    const rawArtifactId = rawText(project.artifactId);
    const rawGroupId = rawText(project.groupId) || rawText(parent.groupId);
    const rawVersion = rawText(project.version) || rawText(parent.version);
    const known: {[key: string]: string | undefined} = {
        'project.artifactId': rawArtifactId,
        'pom.artifactId': rawArtifactId,
        'project.groupId': rawGroupId,
        'pom.groupId': rawGroupId,
        'project.version': rawVersion,
        'pom.version': rawVersion
    };
    const artifactId = resolve(rawArtifactId, properties, known, 'artifact ID');
    if (!artifactId) {
        throw new Error('The Maven POM does not declare an artifact ID.');
    }
    known['project.artifactId'] = artifactId;
    known['pom.artifactId'] = artifactId;
    const groupId = resolve(rawGroupId, properties, known, 'group ID');
    const version = resolve(rawVersion, properties, known, 'project version');
    known['project.groupId'] = groupId;
    known['pom.groupId'] = groupId;
    known['project.version'] = version;
    known['pom.version'] = version;

    const dependencies = list(project.dependencies && project.dependencies.dependency);
    const sdkDependencies = dependencies.filter((dependency) => rawText(dependency.groupId) === 'com.totalcross' && rawText(dependency.artifactId) === 'totalcross-sdk');
    const sdkVersions = sdkDependencies.map((dependency) => resolve(rawText(dependency.version), properties, known, 'TotalCross SDK version'))
        .filter((sdkVersion): sdkVersion is string => !!sdkVersion);
    if (sdkVersions.length !== 1) {
        throw new Error(sdkVersions.length ? 'The Maven POM declares more than one TotalCross SDK version.' : 'The Maven POM must declare exactly one TotalCross SDK version.');
    }
    const plugins = list(project.build && project.build.plugins && project.build.plugins.plugin);
    const plugin = coordinate(plugins, 'com.totalcross', 'totalcross-maven-plugin');
    const configuration = plugin && plugin.configuration;
    const applicationName = resolve(configurationValue(configuration, 'name') || rawText(project.name) || artifactId, properties, known, 'application name') || artifactId;
    const repositories = list(project.repositories && project.repositories.repository)
        .map((repository) => rawText(repository.url))
        .filter((url): url is string => !!url);
    return {
        groupId,
        artifactId,
        version,
        applicationName,
        sdkVersion: sdkVersions[0],
        platforms: platformValues(configuration, properties, known),
        activationKey: resolve(configurationValue(configuration, 'activationKey'), properties, known, 'activation key'),
        certificates: resolve(configurationValue(configuration, 'certificates'), properties, known, 'certificates path'),
        totalcrossHome: resolve(configurationValue(configuration, 'totalcrossHome'), properties, known, 'TotalCross home path'),
        javaRelease: javaRelease(project, properties, known),
        repositories
    };
}
