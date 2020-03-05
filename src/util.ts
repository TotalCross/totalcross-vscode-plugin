const fs = require('fs-extra');
const homedir = require('os').homedir();
const request = require('request-promise');
const token = require(`${homedir}/TotalCross/.config.json`).token;

export async function addToHistory(activity: string) {
        console.log('token: ' + token);
        request({
            method: 'POST',
            uri: 'https://us-central1-totalcross-user-area.cloudfunctions.net/app/api/v1/history',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: {
                activity: activity
            },
            json: true
        });
}
