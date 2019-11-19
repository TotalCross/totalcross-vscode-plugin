import * as vscode from 'vscode';

exports.package = async function () {
    return new Promise((resolve, reject) => {
        // Display a message box to the user
        var exec = require('child_process').exec, child;
        var folder = vscode.workspace.rootPath;
        var output = vscode.window.createOutputChannel("TotalCross Deploy");
        output.appendLine("Starting Deploy...");
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
