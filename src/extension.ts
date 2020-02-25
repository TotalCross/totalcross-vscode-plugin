// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
var Packager = require('./packager');
var Deployer = require('./deployer');
var Creator = require('./creator');
import {login} from './login'; 
import { register } from './register';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	/**
	 * Create new Project
	 */
	let disposable = vscode.commands.registerCommand('extension.createNewProject', function() {
		Creator.createNewProject(context);
	});
	context.subscriptions.push(disposable);
	
	/**
	 * Package
	 */
	disposable = vscode.commands.registerCommand('extension.package', Packager.package);
	context.subscriptions.push(disposable);

	/**
	 * Deploy 
	 */
	disposable = vscode.commands.registerCommand('extension.deploy', Deployer.deploy);
	context.subscriptions.push(disposable);

	/**
	 * Deploy and Run
	 */
	disposable = vscode.commands.registerCommand('extension.deployAndRun', Deployer.deployAndRun);
	context.subscriptions.push(disposable);
	
	
	/**
	 * Login
	 */
	disposable = vscode.commands.registerCommand('extension.login', login);
	context.subscriptions.push(disposable);

	/**
	 * Register
	 */
	disposable = vscode.commands.registerCommand('extension.register', register);
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
