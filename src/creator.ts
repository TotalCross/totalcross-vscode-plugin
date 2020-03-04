import * as vscode from 'vscode';
import {showInputBox} from './components/components';
import { pathToFileURL } from 'url';
import { LoginHandler } from './login';
import { RegisterHandler } from './register';
const core = require('totalcross-core-dev');
const validators = require('./validators/creator');
const fs = require('fs-extra');
const request = require('request');
const xmlParser = require('xml-js');
const replace = require('replace-in-file');

const options: vscode.OpenDialogOptions = {
    canSelectMany: false,
    canSelectFiles: false,
    canSelectFolders: true,
    openLabel: 'Select Project Folder'
};

exports.createNewProject = async function(context: vscode.ExtensionContext) {
    let auth = null;
    let status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100); 
    status.text = `$(sync~spin) TotalCross Checking login credentials...`;
    status.show();
    try {
        auth = await core.auth();
    }
    catch(exp) {
        auth = false;
    }
    status.hide();
    if(!auth) {
        let res = await vscode.window.showErrorMessage('You must login your account in to create a new project', 'Login', 'New Account');
        if(res) {
            if(res === 'Login') {
                new LoginHandler().showLoginPanel();
            }
            else {
                new RegisterHandler().doRegister();
            }
        }
        return;
    }
   let file = await vscode.window.showOpenDialog(options);
    if(file === undefined) {return;}
    
    // Get Project Information
    
    let groupID = await showInputBox(
        'Enter project GroupId',
        'example: com.totalcross',
        validators.groupId
        );
    if(!groupID) {return;}
    let artifactID = await showInputBox(
        'Enter project ArtifactId',
        'example: MyFirstApp', 
        validators.artifactId
        );
    if(!artifactID) {return;}
    let availableVersions = await core.latestVersions(`${context.extensionPath}/resources/maven-metadata.xml`);
    let version = await vscode.window.showQuickPick(availableVersions, {
        placeHolder: 'totalcross sdk version',
        ignoreFocusOut: true

    });
    if(!version) {return;}
    let platforms = await vscode.window.showQuickPick (
        ["-android", "-ios", "-linux", "-linux_arm", "-win32", "-wince"],
        {
            canPickMany: true,
            placeHolder: 'example: -linux_arm',
            ignoreFocusOut: true
        }
    );
    if(!platforms) {return;}
    
    let activationKey = "5443444B5AAEEB90306B00E4";
    if(!activationKey) {return;}
    
    let props = {artifactID, groupID, platforms, version, activationKey};
    let path = file[0].fsPath.toString();
    let packagePath = path + '/src/main/java/' + groupID.replace(/\./g, "/");
    
    // Creates dir
    await fs.ensureDir(packagePath);
    await fs.ensureDir(path + '/src/main/resources');
    await fs.ensureDir(path + '/src/test');

    setupFile(context.extensionPath + '/resources/pom.xml', path + '/pom.xml', props);
    setupFile(context.extensionPath + '/resources/Sample.java', `${packagePath}/${artifactID}.java`, props);
    setupFile(context.extensionPath + '/resources/TestSampleApplication.java',
     `${packagePath}/Run${artifactID}Application.java`, props);
    let uri = file[0];
    vscode.commands.executeCommand('vscode.openFolder', uri);
};





function setupFile(path: string, destPath: string, options: any) {
    return fs.copy(path, destPath)
        .then(async function() {

            let platformsStr = '';
            if(options.platforms) {
                for(let i = 0; i < options.platforms.length; i++) {
                    let platform = `<platform>${options.platforms[i]}</platform>`;
                    if(i < 0 ) {
                        platform = '\t\t\t\t\t\t' + platform;
                    }
                    if(i < options.platforms.length - 1) {
                        platform += '\n';
                    }
                    platformsStr += platform;
                }
            } 
            await replace({files: destPath, from: /\${'groupid'}/g, to: options.groupID}); 
            await replace({files: destPath, from: /\${'artifactid'}/g, to: options.artifactID}); 
            await replace({files: destPath, from: /\${'version'}/g, to: options.version}); 
            await replace({files: destPath, from: /\${'platforms'}/g, to: platformsStr}); 
            await replace({files: destPath, from: /\${'activation_key'}/g, to: options.activationKey}); 
        })
        .catch(function(err: any) {
            vscode.window.showErrorMessage(err);
            console.error(err);
        });
}

function getAvailableVersions(metaDataFilePath: string) {
    return fs.stat(metaDataFilePath)
        .then(function(stats: any) {
            let fileContent = null;
            if(!stats) {
                request('https://maven.totalcross.com/artifactory/repo1/com/totalcross/totalcross-sdk/maven-metadata.xml');
            }

            return fs.readFile(metaDataFilePath)
            .then(function(file: any) {
                let jsonContent = xmlParser.xml2json(file.toString(), {compact: true});
                let jsonObj = JSON.parse(jsonContent);
                let arr = jsonObj.metadata.versioning.versions.version.map((x: any) => x._text);
                arr.sort().reverse();
                return arr;
            })
            .catch(function(err: any) {
                console.log(err);
            });
        });
}