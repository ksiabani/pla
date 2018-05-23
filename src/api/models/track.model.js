const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

// TODO: Make unique the combination of uri and category
// TODO: Change spotify_uri to spotifyUri

const trackSchema = new Schema({
    title: { type: String, required: true },
    artists: { type: Array, required: true },
    styles: { type: Array, required: true },
    category: { type: String, required: true },
    spotify_uri: String,
    lastAddedAt: Date, // last time was added to a playlist
    lastScannedAt: Date // last time a match was attempted
});

trackSchema.plugin(timestamps);
const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
