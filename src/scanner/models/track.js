const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TODO: Make unique the combination of uri and category

const trackSchema = new Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    style: { type: String, required: true },
    category: { type: String, required: true },
    spotify_uri: String
});

const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
