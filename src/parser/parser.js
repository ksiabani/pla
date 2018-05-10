const mongoose = require('mongoose');
const Track = require('../api/models/track');
const Beatport = require('./providers/beatport.provider');

mongoose.connect('mongodb://localhost/albdb');
const beatport = new Beatport();


const foo = async () => {
    try {
        const meta = await beatport.parser();
        const options = {upsert: true, new: true, setDefaultsOnInsert: true};
        for (let obj of meta) {
            const query = {title: obj.title, artist: obj.artist, category: obj.category};
            // const track = new Track(obj);
            // await track.save();
            await Track.findOneAndUpdate(query, {styles: obj.styles,}, options);
        }
        console.log('end');
    }
    catch (error) {
        console.log(error);
    }
};

foo();
