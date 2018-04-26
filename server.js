'use strict';

const express = require('express');
const app = express();
const port = process.env.PORT || 3500;

const routes = require('./api/routes');
routes(app);

app.listen(port);

console.log("Node application running on port " + port);

// https://github.com/thelinmichael/spotify-web-api-node
// https://www.npmjs.com/package/passport-spotify
// https://www.npmjs.com/package/spotify-uri