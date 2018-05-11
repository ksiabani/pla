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
            await Track.findOneAndUpdate(query, {styles: piece.styles,}, options);
        }
        console.log(`Done parsing ${meta.length} titles.`);
    }
    catch (error) {
        console.log(error);
    }
};

go();
