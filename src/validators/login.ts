/*
 * Copyright (C) 2020-2021 TotalCross Global Mobile Platform Ltda.
 * SPDX-License-Identifier: MIT
 */

export function validateLogin(value: string) {
        if(!value) {
            return 'Login cannot be empty!';
        }
        return null;
}

export function validatePassword(value: string) {
    if(!value) {
        return 'Password cannot be empty!';
    }
    return null;
}
