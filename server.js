const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT || 5000;
const mongoDbUri = process.env.MONGODB_URI;
const mongoDbTestUri = process.env.MONGODB_TEST;
const routes = require('./src/routes');
const app = express();

function bootstrap(isTestingEnv = false) {
    // todo add testing mongo uri
    mongoose.connect(isTestingEnv ? "mongodb://localhost:27017/aldbtest" : mongoDbUri);
    routes(app);
    app.listen(port);
    console.log("Node application running on port " + port);
    return app
}

bootstrap()

module.exports = bootstrap;