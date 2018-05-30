const mongoose = require('mongoose');
const mongoDbUri = process.env.MONGODB_URI;

module.exports = {
    mongoose,
    connect: () => {
        mongoose.Promise = Promise;
        mongoose.connect(mongoDbUri);
    },
    disconnect: (done) => {
        mongoose.disconnect(done);
    },
};