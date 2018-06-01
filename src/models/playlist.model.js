const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
    name: {type: String, required: true},
    styles: {type: Array, required: true},
    category: {type: String, required: true}, // featured, curated or album
    imgUrl: {type: String, required: true}
    // TODO: add tracks
});

// Get all playlists (no limit)
playlistSchema.statics.getPlaylists = function () {
    return this.model('Playlist')
        .find()
        .sort({updatedAt: -1})
        .exec();
};

// Get all tracks that have been found on Spotify
playlistSchema.statics.getPlaylist = function (playlistId) {
    return this.model('Playlist')
        .findOne({
            _id: playlistId
        })
        .exec();
};

// Get featured playlists
playlistSchema.statics.getFeaturedPlaylists = function (options) {
    return this.model('Playlist')
        .find({
            category: 'featured',
            styles: { $in: options.styles }
        })
        .sort({updatedAt: -1})
        .exec();
};

// Get curated playlists
playlistSchema.statics.getCuratedPlaylists = function (options) {
    return this.model('Playlist')
        .find({
            category: 'curated',
            styles: { $in: options.styles }
        })
        .sort({updatedAt: -1})
        .exec();
};

playlistSchema.plugin(timestamps);
const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
