/*
 * Copyright (C) 2022-2026 Amalgam Solucoes em TI Ltda.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from 'assert';
import {latestVersionForEachMajor, metadataVersions} from '../../maven-metadata';

suite('Maven metadata', () => {
    test('sorts metadata versions and selects the latest version of each major', () => {
        const metadata = `<?xml version="1.0"?>
            <metadata><versioning><versions>
              <version>5.1.3</version><version>6.0.2</version>
              <version>5.0.0</version><version>6.0.1</version>
            </versions></versioning></metadata>`;
        const versions = metadataVersions(metadata);

        assert.deepEqual(versions, ['6.0.2', '6.0.1', '5.1.3', '5.0.0']);
        assert.deepEqual(latestVersionForEachMajor(versions), ['6.0.2', '5.1.3']);
    });
});
