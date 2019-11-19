import * as vscode from 'vscode';
var node_ssh = require('node-ssh');
var validators = require('./validators/deployer');
const pomParser = require('pom-parser');
const Packager = require('./Packager');

var ssh = new node_ssh();
var folder: any;
var username: any;
var host: any;
var pom: any;
var password: any;
exports.deploy = async function() {
    return new Promise(async function (resolve){
        let workspaceFolders = vscode.workspace.workspaceFolders;
    if(!workspaceFolders) {
        vscode.window.showErrorMessage("TotalCross project not found in this vscode instance.");
        resolve(false);   
        return;
    }
    let file = workspaceFolders[0].uri.fsPath + "/target/install/linux_arm";
    let pomPath = workspaceFolders[0].uri.fsPath + "/pom.xml";
    pom = await new Promise(resolve2 => {
        pomParser.parse({filePath: pomPath}, function(err: any, response: any) {
            resolve2(response.pomObject);
        });
    });

    await Packager.package();
    // ask user
    if(!username) {
        username = await vscode.window.showInputBox({
            prompt: 'ssh user',
            value: username === undefined ? undefined : username,
            validateInput: validators.user
        });
    }
    if(!username) {resolve(false); return;}
    
    // ask user
    if(!host) {
        host = await vscode.window.showInputBox({
            prompt: 'ssh host',
            value: host === undefined ? undefined : host,
            validateInput: validators.user
        });
    }
    if(!host) {resolve(false); return;}

    // ask password
    if(!password) {
        password = await vscode.window.showInputBox({
            prompt: 'host password',
            value: password === undefined ? undefined : password
        });
        console.log(password);
    }
    // ask app folder
    // ask user
    if(!folder) {
        folder = await vscode.window.showInputBox({
            prompt: 'app host folder',
            value: folder === undefined ? `/home/${username}/${pom.project.name}` : folder,
            validateInput: validators.user
        });
    }
    if(!folder) {resolve(false); return;}
    
    let options = {
        username,
        host,
        password,
        port: 22,
        tryKeyboard: true,
        onKeyboardInteractive: (name: any, instructions: any, instructionsLang: any, prompts: any, finish: any) => {
            if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
                finish(vscode.window.showInputBox({prompt: 'password', password: true}));
        }
    }
    };
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Deploying TotalCross Application...'
    }, async (progress, token) => {
        await ssh.connect(options)
        .then(function (status: any) {
            ssh.putDirectory(file, folder)
                .then(function(status: any) {
                    resolve(status);
                    if(status) {
                        vscode.window.showInformationMessage('TotalCross Application succesfully deployed.');
                    }
                })
                .catch(function(err: any) {
                    vscode.window.showErrorMessage(err.message);
                    resolve(false);
                });
        })
        .catch(function (err: any) {
            resolve(false);
            vscode.window.showErrorMessage(err.message);
        });
    });
    });
};

exports.deployAndRun = async function() {
    let workspaceFolders = vscode.workspace.workspaceFolders;
    if(!workspaceFolders) {
        vscode.window.showErrorMessage("TotalCross project not found in this vscode instance.");
        return;
    }
    
    let success = await exports.deploy();
    if(success) {
        let output = vscode.window.createOutputChannel('TotalCross Deploy and Run');
        output.show();
        ssh.execCommand(
            `cd ${folder} && export DISPLAY=:0 && chmod +x ${pom.project.name} && ./${pom.project.name}`, {
            // ssh.execCommand(`cd /home/root/blah && export DISPLAY=:0 && nohup ./BlahApp`, {
            onStdout(chunk: any) {
                output.appendLine(chunk.toString('utf8'));
            },
            onStderr(chunk: any) {
                output.appendLine(chunk.toString('utf8'));
            },
          }).then(function(result: any) {
            output.appendLine('exit code: ' + result.code);
          })
          .catch(function (err: any) {
            vscode.window.showErrorMessage(err.message);
          });
    }
};

