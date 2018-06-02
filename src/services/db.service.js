const mongoose = require('mongoose');

module.exports = mongodbUri => ({
    connect: () => mongoose.connect(mongodbUri),
    disconnect: done => mongoose.disconnect(done)
});

// TODO: Check default pool size. See:
// https://stackoverflow.com/questions/12788601/is-it-a-good-idea-to-have-multiple-mongo-connections-open-from-a-single-node-js
// https://stackoverflow.com/questions/10039163/does-mongoose-allow-for-multiple-database-requests-concurrently/10039854#10039854
// https://stackoverflow.com/questions/19474712/mongoose-and-multiple-database-in-single-node-js-project/19475259#19475259
// The idea is that mongoose is connected here for the whole app and it handles multiple connections through
// MongoDBs pool size (default 5). If you want to start another connection to another server (e.g test) you can do it
// through calling this service

// TODO: Do you really need this service?
// You could just use mongoose.connect(uri) where you need to, instead of db.connect(uri)
// http://www.albertgao.xyz/2017/06/19/test-your-model-via-jest-and-mongoose/
