import * as vscode from 'vscode';

export function showInputBox(prompt: string, placeHolder: string, validator: any) {
    const options: vscode.InputBoxOptions = {
        prompt: prompt,
        placeHolder: placeHolder,
        validateInput: validator,
        ignoreFocusOut: true
    };
    return vscode.window.showInputBox(options);
}

export function showInputBoxPassword(prompt: string, placeHolder: string, validator: any) {
    const options: vscode.InputBoxOptions = {
        prompt: prompt,
        ignoreFocusOut: true,
        placeHolder: placeHolder,
        validateInput: validator,
        password: true
    };
    return vscode.window.showInputBox(options);
}