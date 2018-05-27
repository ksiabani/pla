const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

// TODO: Make unique the combination of uri and category
// TODO: Change spotify_uri to spotifyUri

const trackSchema = new Schema({
    title: {type: String, required: true},
    artists: {type: Array, required: true},
    styles: {type: Array, required: true},
    category: {type: String, required: true},
    spotify_uri: String,
    lastAddedAt: Date, // last time was added to a playlist
    lastScannedAt: Date // last time a match was attempted
});

// assign a function to the "methods" object of our animalSchema
// trackSchema.methods.findSimilarTypes = function(cb) {
//     return this.model('Animal').find({ type: this.type }, cb);
// };

trackSchema.statics.getRandomScannedNotMatched = function () {
    return this.model('Track')
        .aggregate([{$match: {spotify_uri: null, lastScannedAt: {$ne: null}}}])
        .sample(100)
        .exec();
};

trackSchema.statics.getNotScanned = function () {
    return this.model('Track')
        .find({spotify_uri: null, lastScannedAt: null}, {}, {lean: true})
        .limit(100)
        .exec();
};

trackSchema.plugin(timestamps);
const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
