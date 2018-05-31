const port = process.env.PORT || 5000;
const app = require('./app');
const mongodbUri = process.env.MONGODB_URI;
const db = require('./services/db.service')(mongodbUri);

async function go() {
    try {
        await db.connect();
        console.log(`Connected to Mongo.`);
        await app.listen(port);
        console.log(`Node application running on port ${port}.`);
    }
    catch (error) {
        console.log(error);
    }
}

go();
