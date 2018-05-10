const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT || 3500;
const routes = require('./src/api/routes');
const app = express();

mongoose.connect('mongodb://localhost:27017/albdb');
routes(app);
app.listen(port);
console.log("Node application running on port " + port);
