import * as vscode from 'vscode';
import * as util from './util';
import { pathToFileURL } from 'url';
const fs = require('fs-extra');
const request = require('request-promise');
const jsonfile = require('jsonfile');


export interface InputProcessor {
    askForInput() : Thenable<any>;
}

export class DefaultInputProcessor implements InputProcessor{
    
    askForInput () {
        let yesStr = 'Yes, send anonymous reports';
        let noStr = "Don't send";
        return vscode.window.showInformationMessage(
            "We'd like to collect anonymous telemetry data to help us prioritize improvements." +
            "This includes how often you deploy and launches (on simulator) your app, witch OS" +
            " you deploy for, your timezone and which totalcross version you're using. We do no" + 
            "t collect any personal data or sensitive information. Do you allow TotalCross to " +
            "send us anonymous report?",
            
            yesStr,
            noStr
            ).then(function (value) {
                if (value === yesStr) { return true; }
                else if (value === noStr) { return false; }
                else { return null; }
            });
    }


}
export class ConfigChecker {
    
    path: string = util.getTotalCrossConfigHomePath() + '/config.json';
    inputProcessor = new DefaultInputProcessor();
    reqAddress: string = 'https://statistics.totalcross.com/api/v1/users/get-anonymous-uuid';
    
    async checkConfigFile () {
        await fs.ensureFile(this.path);
        let data = null;
        try {
            data = await jsonfile.readFile(this.path);
        } catch (e) {}
        if(data == null  || data.userAcceptedToProvideAnonymousData === undefined) {
            if(!data) {
                data = {};
            }
            
            let input = await this.inputProcessor.askForInput();
            
            if(input !== null) {
                data.userAcceptedToProvideAnonymousData = input;
                await this.saveConfig(data);
            }
            else {
                return;
            }
            if(input === false) {
                return null;
            }
            await this.getUuid(data);
            this.saveConfig(data);
        }
        else if(!data.uuid) {
            await this.getUuid(data);
            this.saveConfig(data);
        }
    }

    async getUuid(obj: any) {
        return request(this.reqAddress)
            .then(function(res: any) {
                if(res) {
                    obj.uuid = JSON.parse(res).uuid;
                }
            });
    }

    async saveConfig(data: any) {
        return jsonfile.writeFileSync(this.path, data);
    }
}


