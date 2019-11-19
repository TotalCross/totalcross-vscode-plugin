import * as vscode from 'vscode';

exports.user = function(value: string) {
        if(!value) {
            return 'user is required!';
        }
        return null;
};