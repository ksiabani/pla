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

// Randomly get a 100 tracks that were previously searched for, but not found on Spotify
trackSchema.statics.getRandomScannedNotMatched = function () {
    return this.model('Track')
        .aggregate([
            {
                $match: {
                    spotify_uri: null,
                    lastScannedAt: {
                        $ne: null
                    }
                }
            }
        ])
        .sample(100)
        .exec();
};

// Get tracks that have not been searched for on Spotify, limit to a 100 to avoid rate limiting
trackSchema.statics.getNotScanned = function () {
    return this.model('Track')
        .find({
            spotify_uri: null,
            lastScannedAt: null
        }, {}, {lean: true})
        .limit(100)
        .exec();
};

// Get all tracks that have been found on Spotify
// TODO: limit results, add pagination
// TODO: Sort by release date
trackSchema.statics.getTracks = function () {
    return this.model('Track')
        .find({
            spotify_uri: {
                $ne: null
            }
        })
        .exec();
};

// Get all tracks that have been found on Spotify
trackSchema.statics.getTrack = function (trackId) {
    return this.model('Track')
        .findOne({
            _id: trackId
        })
        .exec();
};

// Get new tracks that have been found on Spotify
// TODO: limit results, add pagination
trackSchema.statics.getNewTracks = function (options) {
    return this.model('Track')
        .find({
            category: 'new',
            spotify_uri: {
                $ne: null
            },
            styles: { $in: options.styles }
        })
        .exec();
};

// Get new tracks that have been found on Spotify
// TODO: limit results, add pagination
// TODO: Test this when tops are added
trackSchema.statics.getTopTracks = function () {
    return this.model('Track')
        .find({
            category: 'top',
            spotify_uri: {
                $ne: null
            },
            styles: { $in: options.styles }
        })
        .exec();
};

trackSchema.plugin(timestamps);
const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
