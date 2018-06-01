const express = require('express');
const routes = require('./routes/index');
const app = express();

routes(app);

module.exports = app;
