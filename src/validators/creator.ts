import * as vscode from 'vscode';

exports.groupId = function(value: string) {
        if(value.match(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*[0-9a-z_]/)) {
            return null;
        }
        else {
            return "Invalid groupId Pattern try something like 'com.yourcompany'";
        }
};

exports.artifactId = function(value: string) {
    if(value.match(/^[a-zA-Z][a-zA-Z0-9_]*/)) {
        return null;
    }
    else {
        return "Invalid artifactId Pattern. It must begin with a letter.";
    }
};

exports.activationKey = function(value: string) {
    if(value.length !== 24 || !value.match(/^[A-Z0-9]*/)) {
        return 'Activation key must have length 24 and be comprised by numbers and capitilized letters only';
    }
    return null;
};