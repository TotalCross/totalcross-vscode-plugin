/*
 * Copyright (C) 2020-2021 TotalCross Global Mobile Platform Ltda.
 * SPDX-License-Identifier: MIT
 */

import * as vscode from 'vscode';

exports.user = function(value: string) {
        if(!value) {
            return 'user is required!';
        }
        return null;
};
