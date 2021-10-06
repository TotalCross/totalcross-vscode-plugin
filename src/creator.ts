import * as vscode from 'vscode';
import {showInputBox} from './components/components';
import { pathToFileURL } from 'url';
import * as util from './util';

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
    
    let mavenPluginVersion = await core.mavenPluginLatestVersion();

    let props = {artifactID, groupID, platforms, version, activationKey, mavenPluginVersion};
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
                    if(i > 0) {
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
            await replace({files: destPath, from: /\${'maven_plugin_version'}/g, to: options.mavenPluginVersion})
        })
        .catch(function(err: any) {
            vscode.window.showErrorMessage(err);
            console.error(err);
        });
}