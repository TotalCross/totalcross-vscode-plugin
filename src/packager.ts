import * as vscode from 'vscode';
import {addToHistory} from './util';
var output = vscode.window.createTerminal("TotalCross Packager");

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
        output.show();        
        output.sendText("mvn package");    
        // child = exec(`cd ${folder} && mvn package`);		
        // child.stdout.on('data', function(data: string) {
        //     output.sendText(`echo ${data}`, false);
        // });
        // child.on('close', (code: number) => {
        //     if(code === 0){
        //         resolve(code);
        //     }
        //     else {
        //         reject(code);
        //     }
        // });
    });    
};
/**
 * Executes mvn package
 */
