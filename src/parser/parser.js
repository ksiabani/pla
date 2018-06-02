const mongoose = require('mongoose');
const mongoDbUri = process.env.MONGODB_URI;
const Track = require('../models/track.model');
const Beatport = require('./providers/beatport.provider');
const Traxsource = require('./providers/traxsource.provider');

mongoose.connect(mongoDbUri);

const beatport = new Beatport();
const traxsource = new Traxsource();

const providers = [
    beatport,
    traxsource
];

const go = async () => {
    try {
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
