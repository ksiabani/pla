const mongoose = require('mongoose');
const Track = require('../api/models/track.model');
const Beatport = require('./providers/beatport.provider');

mongoose.connect('mongodb://localhost/albdb');
const beatport = new Beatport();


const go = async () => {
    try {
        const meta = await beatport.parser();
        const options = {upsert: true, new: true, setDefaultsOnInsert: true};
        for (let piece of meta) {
            const query = {title: piece.title, artist: piece.artist, category: piece.category};
            // TODO: Change this so data is inserted only if not found
            // findOneAndUpdate will update every document and that prevents
            // playlist updater to find tracks were recently changed (uri added)
            await Track.findOneAndUpdate(query, {styles: piece.styles}, options);
        }
        console.log(`Done parsing ${meta.length} titles.`);
    }
    catch (error) {
        console.log(error);
    }
};

go();
