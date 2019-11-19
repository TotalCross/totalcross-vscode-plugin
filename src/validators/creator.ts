import * as vscode from 'vscode';

exports.groupId = function(value: string) {
        if(value.match(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*[0-9a-z_]/)) {
            return null;
        }
        else {
            return "Invalid groupId Pattern try something like 'com.yourcompany'";
        }
};