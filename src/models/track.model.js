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
    lastScannedAt: Date, // last time a match was attempted,
    releaseDate: Date // release date of the track's album from Spotify
});

// Randomly get n tracks that were previously searched for, but not found on Spotify
trackSchema.statics.getRandomScannedNotMatched = function (n) {
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
        .sample(n)
        .exec();
};

// Get tracks that have not been searched for on Spotify, limit to n to avoid rate limiting
trackSchema.statics.getNotScanned = function (n) {
    return this.model('Track')
        .find({
            spotify_uri: null,
            lastScannedAt: null
        }, {}, {lean: true})
        .limit(n)
        .exec();
};

// Get all tracks that have been found on Spotify (with limit)
// TODO: add pagination
trackSchema.statics.getTracks = function () {
    return this.model('Track')
        .find({
            spotify_uri: {
                $ne: null
            }
        })
        .sort({releaseDate: -1})
        .limit(100)
        .exec();
};

// Get all tracks that have been found on Spotify (spotify_uri not null) and given field is null (or not there).
// Returns all records (no limit)
trackSchema.statics.getTracksToUpdate = function (field) {
    let query = {};
    query['spotify_uri'] = {$ne: null};
    query[field] = null;
    return this.model('Track')
        .find(query)
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
            releaseDate: {
                $ne: null
            },
            styles: { $in: options.styles }
        })
        .sort({releaseDate: -1})
        .limit(100)
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
            releaseDate: {
                $ne: null
            },
            styles: { $in: options.styles }
        })
        .sort({releaseDate: -1})
        .limit(100)
        .exec();
};

trackSchema.plugin(timestamps);
const Track = mongoose.model('Track', trackSchema);

module.exports = Track;
