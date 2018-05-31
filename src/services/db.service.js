const mongoose = require('mongoose');
const mongoDbUri = process.env.MONGODB_URI;

module.exports = {
    mongoose,
    connect: (mongoDbTestUri) => {
        mongoose.Promise = Promise;
        mongoose.connect(mongoDbUri || mongoDbTestUri);
    },
    disconnect: (done) => {
        mongoose.disconnect(done);
    },
};