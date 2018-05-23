const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT || 5000;
const mongoDbUri = process.env.MONGODB_URI;
const routes = require('./src/routes');
const app = express();

mongoose.connect(mongoDbUri);
routes(app);
app.listen(port);
console.log("Node application running on port " + port);
