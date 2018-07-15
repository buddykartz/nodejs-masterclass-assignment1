/*
* Configuration object for the app
*/

var environments = {};

environments.stage = {
    httpPort: 5000,
    httpsPort: 5001,
    env: 'stage'
};

environments.prod = {
    httpPort: 8080,
    httpsPort: 8443,
    env: 'prod'
};

var currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.stage;

module.exports = environmentToExport;
