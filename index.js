/*
 *
 * Primary file for the API
 *
 */

// Dependencies
const http = require('http'),
    https = require('https'),
    fs = require('fs'),
    url = require('url'),
    StringDecoder = require('string_decoder').StringDecoder
    config = require('./config');

// The server should respond to all requests with a string
const httpServer = http.createServer(function(req, res) {
    unifiedRouter(req, res);
});

// Start the http server
httpServer.listen(config.httpPort, function() {
    console.log(`The http server is listening on port ${config.httpPort}`);
});

var httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem')
};

// The server should respond to all requests with a string
const httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedRouter(req, res);
});

// Start the https server
httpsServer.listen(config.httpsPort, function() {
    console.log(`The http server is listening on port ${config.httpsPort}`);
});

// define a handlers container object
const handlers = {};

// hello world handler
handlers.helloWorld =  function (data, callback) {
    callback(200, { data: { status: 'Hello World!' }});
};

// ping handler
handlers.ping =  function (data, callback) {
    callback(200, { data: { status: 'Pong!!!' }});
};

// 404 handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// define a request router
const router = {
    'ping': handlers.ping,
    'helloworld': handlers.helloWorld
}

const unifiedRouter = function(req, res) {
    // Get the URL and parse it
    let parsedUrl = url.parse(req.url, true),

        // Get the path
        path = parsedUrl.pathname,
        trimmedPath = path.replace(/^\/+|\/+$/g, ''),
        queryString = parsedUrl.query,
        method = req.method.toLowerCase(),

        // get the headers as an object
        headers = req.headers;

        // get the payload, if any
        decoder = new StringDecoder('utf-8'),
        buffer = '';

    req.on('data', function (data) {
        buffer += decoder.write(data);
    });

    req.on('end', function () {
        buffer += decoder.end();

        // Choose the route handler based on the request path.
        let selectedHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound,

            // Counstruct the data object to send to handler
            data = {
                trimmedPath,
                method,
                queryString,
                headers,
                payload: buffer
            };

        // Route the request to handler specified in the router
        selectedHandler(data, function(statusCode, payload) {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            payload = typeof(payload)  == 'object' ? payload : {};

            var payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // log the request path
            console.log('Returning this response: ', statusCode, payloadString);
        });
    });
};
