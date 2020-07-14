import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {InputProcessor, ConfigChecker} from '../../config-checker';
import * as util from '../../util';
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
// import * as myExtension from '../extension';

suite('Creator', () => {
	vscode.window.showInformationMessage('Start all tests.');
	let creatorValidator = require('../../validators/creator');

	test('GroupId validator', () => {
		// assert.equal(creatorValidator.groupId('com.totalcross'), null);
		// assert.equal(creatorValidator.groupId('totalcross'), null);
		// assert.equal(creatorValidator.groupId('com.123.totalcross'), null);
		// assert.notEqual(creatorValidator.groupId('.com.totalcross'), null);
		// assert.notEqual(creatorValidator.groupId('com.totalcross.'), null);
		// assert.notEqual(creatorValidator.groupId('.'), null);
		// assert.notEqual(creatorValidator.groupId('1com.totalcross'), null);
		// assert.notEqual(creatorValidator.groupId(''), null);
	});
});

