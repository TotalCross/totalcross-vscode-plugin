import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {InputProcessor, ConfigChecker} from '../../config-checker';
import * as util from '../../util';
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
	
let cc = new ConfigChecker();
let tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-test-'));	
cc.path = path.join(tempDir, 'config.json');
let stageServer = cc.reqAddress = 'https://aqueous-plateau-93003.herokuapp.com/api/v1/users/get-anonymous-uuid';

let positiveInputProcessor = {
	askForInput () {
		return new Promise((resolve, reject) => resolve(true));
	}
} as InputProcessor;
let negativeInputProcessor = {
	askForInput () {
		return new Promise((resolve, reject) => resolve(false));
	}
} as InputProcessor;
let nullInputProcessor = {
	askForInput () {
		return new Promise((resolve, reject) => resolve(null));
	}
} as InputProcessor;

// suite('config checker with internet connection', async () => {
// 	test ('should write a config file with uuid and userAccepted flag equal true', (done) => {
// 			cc.inputProcessor = positiveInputProcessor;
// 			cc.checkConfigFile()
// 				.then(function () {
// 					let configFile = require(cc.path);
// 					assert.strictEqual(configFile.userAcceptedToProvideAnonymousData, true);
// 					assert.notEqual(configFile.uuid, null);
// 					fs.unlink(cc.path)
// 						.then(()=> done());
// 				});			
// 	}).timeout(5000);

// 	test ('should only write a config file with user did not accepted to provide anonymous info', (done) => {
// 		cc.inputProcessor = negativeInputProcessor;
// 		cc.checkConfigFile()
// 			.then(function () {
// 				let configFile = require(cc.path);
// 				assert.strictEqual(configFile.userAcceptedToProvideAnonymousData, false);
// 				assert.equal(configFile.uuid, null);
// 				fs.unlink(cc.path)
// 					.then(()=> done());
// 			});	
// 	}).timeout(5000);
	
	
// });

