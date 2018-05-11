const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

// TODO: Make unique the combination of uri and category
// TODO: Add creation and update date
// UserSchema.plugin(timestamps);

const trackSchema = new Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    styles: { type: Array, required: true },
    category: { type: String, required: true },
    spotify_uri: String
});

trackSchema.plugin(timestamps);
const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
