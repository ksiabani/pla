const Track = require('../models/track.model');
const Beatport = require('./providers/beatport.provider');
const Traxsource = require('./providers/traxsource.provider');
const mongodbUri = process.env.MONGODB_URI;
const db = require('../services/db.service')(mongodbUri);

const beatport = new Beatport();
const traxsource = new Traxsource();

const providers = [
    beatport,
    traxsource
];

const go = async () => {
    try {
        await db.connect();
        console.log(`Connected to Mongo.`);
        for (let provider of providers) {
            const meta = await provider.parser();
            const options = {upsert: true, new: true, setDefaultsOnInsert: true};
            for (let piece of meta) {
                const query = {title: piece.title, artists: piece.artists, category: piece.category};
                // TODO: Revise findOneAndUpdate? Works fine but this will update every record
                // Is there other way to insert if not found?
                // TODO: Return count of new records added
                await Track.findOneAndUpdate(query, {styles: piece.styles}, options);
            }
            console.log(`Done parsing ${meta.length} titles from ${provider.constructor.name}`);
        }
        console.log('The end.');
    }
    catch (error) {
        console.log(error);
    }
};

go();
