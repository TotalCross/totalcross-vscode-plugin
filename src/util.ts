const fs = require('fs-extra');
const envPaths = require('env-paths');
const paths = envPaths('TotalCross', {suffix: null});
const request = require('request-promise');


export function getTotalCrossConfigHomePath() : string{
    return paths.config;
}