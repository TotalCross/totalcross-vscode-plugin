const core = require('totalcross-core-dev');
import {showInputBox, showInputBoxPassword} from './components/components';
import {validateLogin, validatePassword} from './validators/login';
import {Response} from './model/response';
import * as vscode from 'vscode';
export class LoginHandler {
    /**
     * Show login an then password
     * return true if some error happen 
     */
    async showLoginPanel() : Promise<Response>{
        return new Promise(async function(resolve, reject) {
            let login = await showInputBox(
                'Login',
                'dev@first.com', 
                validateLogin
                );
            if(!login) {
                return reject({
                    error: true,
                    message: 'Empty login!'
                });
            } 
            let password = await showInputBoxPassword(
                'Password',
                'password', 
                validateLogin
                );

            if(!password) {
                return reject({
                    error: true,
                    message: 'Empty password!'
                });
            }
            
            let myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100); 
            myStatusBarItem.text = `$(sync~spin) TotalCross Login Request...`;
            myStatusBarItem.show();
            return core.login({
                email: login, 
                password: password
            })
            .then((response: any) => {
                vscode.window.showInformationMessage("TotalCross: you have successfully logged in.");
                return {
                    error: false,
                    message: response
                };
            })
            .catch((error: any) => {
                vscode.window
                .showErrorMessage("TotalCross: something got wrong, verify your credentials and try again");
                return {
                    error: true,
                    message: error
                };
            })
            .then(() => myStatusBarItem.hide());
        });
        

        

    }
}

export function login() {
    let loginHandler = new LoginHandler();
    loginHandler.showLoginPanel();
}