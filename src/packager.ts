import * as vscode from 'vscode';
import {addToHistory} from './util'; 
exports.package = async function () {
    return new Promise((resolve, reject) => {
        // Display a message box to the user
        addToHistory('package');
        var exec = require('child_process').exec, child;
        let workspaceFolders = vscode.workspace.workspaceFolders;
        if(!workspaceFolders) {
            vscode.window.showErrorMessage("TotalCross project not found in this vscode instance.");
        return;
        }
        let folder = workspaceFolders[0].uri.fsPath;
        if(process.platform === 'win32') {
            folder = "/d " + folder;
        }
        var output = vscode.window.createOutputChannel("TotalCross Deploy");
        output.appendLine("Starting Package...");
        output.show();
        child = exec(`cd ${folder} && mvn package`);		
        child.stdout.on('data', function(data: string) {
            output.append(data);
        });
        child.on('close', (code: number) => {
            if(code === 0){
                resolve(code);
            }
            else {
                reject(code);
            }
        });
    });    
};
/**
 * Executes mvn package
 */
