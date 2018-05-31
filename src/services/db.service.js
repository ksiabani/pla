const mongoose = require('mongoose');

module.exports = mongodbUri => ({
    mongoose,
    connect: () => mongoose.connect(mongodbUri),
    disconnect: done => mongoose.disconnect(done)
});
