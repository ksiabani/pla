const config = require('../../config');
const spotify = require('../services/spotify.service');
const Track = require('../models/track.model');

const getSpotifyMe = async (reg, res) => {
    try {
        const response = await spotify.getMe();
        res.json(response.body);
    } catch (error) {
        res.send(error.message);
    }
};

const loginWithSpotify = (req, res) => {
    res.redirect(spotify.createAuthorizeURL(config.spotify.scopes));
};

const setAccessToken = (req, res) => {

    const code = req.query.code;
    spotify.authorizationCodeGrant(code).then(
        function (data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);

            // Set the access token on the API object to use it in later calls
            spotify.setAccessToken(data.body['access_token']);
            spotify.setRefreshToken(data.body['refresh_token']);
            res.redirect('/');
        },
        function (err) {
            console.log('Something went wrong!', err);
        }
    );

};

const playlistUris = {
    house: {
        new: '6WlLThhqhYLtivKnlBALC8',
        top: ''
    },
    electronica: {
        new: '7uIhCfXZlwnKlH0wMoyFce',
        top: ''
    },
    liquid: {
        new: '1HrrXgJSqdBzJBhk44nByG',
        top: ''
    }
};

const matcher = async (req, res) => {
    try {
        // Get tracks that don't have a uri
        const meta = await Track.find({spotify_uri: null}).exec();
        let updated = 0;
        const options = {multi: true};
        for (let item of meta) {
            // TODO: Is searcher good with commas or should I remove them from artists names
            // TODO: Improve search, some tracks do contain original mix
            const query = {title: item.title, artist: item.artist};
            const track = await spotify.searchTracks(`track:${item.title} artist:${item.artist}`, {limit: 1});
            const uri = track && track.body.tracks.items[0] && track.body.tracks.items[0].uri;
            const releaseDate = track && track.body.tracks.items[0] && track.body.tracks.items[0].album.release_date.split('-')[0];
            if (uri && releaseDate && releaseDate >= new Date().getFullYear()) {
                const response = await Track.update(query, {spotify_uri: uri}, options);
                if (response.nModified > 0) {
                    updated += response.nModified;
                }
            }
        }
        res.send(`${updated} tracks were matched`);

    }
    catch (error) {
        console.log(error);
        res.send(error.message);
    }
};

const getUserPlaylists = async (req, res) => {
    try {
        const user = await spotify.getMe();
        const response = await spotify.getUserPlaylists(user.body.id);
        res.json(response.body);
    }
    catch (error) {
        res.send(error.message);
    }

};

const getPlaylist = async (req, res) => {
    try {
        const user = await spotify.getMe();
        const playlistId = req.params.playlistId;
        const response = await spotify.getPlaylist(user.body.id, playlistId);
        res.send(response.body);
    }
    catch (error) {
        res.send(error.message);
    }
};

const updatePlaylist = async (req, res) => {
    try {
        const user = await spotify.getMe();
        const userId = user.body.id;
        const playlistId = req.params.playlistId;
        const playlist = await spotify.getPlaylist(userId, playlistId);
        const style = playlist.body.description;
        let text;
        let tracks = playlist.body.tracks.items;

        // Sort playlist tracks by date ascending
        if (tracks.length) {
            tracks.sort((a, b) => {
                if (new Date(a.added_at) > new Date(b.added_at)) {
                    return 1;
                }
                if (new Date(a.added_at) < new Date(b.added_at)) {
                    return -1;
                }
                if (new Date(a.added_at).getTime() === new Date(b.added_at).getTime()) {
                    return 0;
                }
            });
        }
        text = `Playlist has ${tracks.length} tracks\n`;

        // Get the date the last track was added
        const lastAddedDate = tracks.length && new Date(tracks[tracks.length - 1].added_at) || null; // fastest option
        text += `Last track in playlist was added at ${lastAddedDate}\n`;

        // Find tracks in db since last added date that have been matched (max 99)
        // These are the tracks we will add in a minute

        // TODO: Change this with updatedAt or else when ready
        // Remember db could be updated for anything
        const query = lastAddedDate ?
            {spotify_uri: {$ne: null}, styles: style, createdAt: {"$gt": new Date(lastAddedDate)}} :
            {spotify_uri: {$ne: null}, styles: style};
        const recentlyMatchedTracks = await Track.find(query, {}, {lean: true}).exec();
        const recentlyMatched = recentlyMatchedTracks.splice(0, 99);
        const recentlyMatchedUris = recentlyMatched.map(track => track.spotify_uri);
        text += `Since then ${recentlyMatched.length} tracks have been matched.\n`;

        // Get the tracks to remove from the playlist
        const tracksToRemoveUris = tracks.slice(0, recentlyMatched.length).map(track => {
            return {uri: track.track.uri}
        });
        text += `${tracksToRemoveUris.length} tracks will be removed from the playlist.\n`;

        // Remove tracks from playlist
        if (tracksToRemoveUris && tracksToRemoveUris.length) {
            await spotify.removeTracksFromPlaylist(userId, playlistId, [...tracksToRemoveUris]);
        }

        // Add tracks to playlist
        if (recentlyMatchedUris && recentlyMatchedUris.length) {
            await spotify.addTracksToPlaylist(userId, playlistId, [...recentlyMatchedUris]);
        }

        res.send(text);
    }
    catch (error) {
        res.send(error.message);
    }
};

module.exports = {
    loginWithSpotify,
    setAccessToken,
    getSpotifyMe,
    matcher,
    getUserPlaylists,
    getPlaylist,
    updatePlaylist
};

// Playlist rules:
// * Max no of track is 99
// * No duplicates
// * No collections
// * When newer tracks are added older tracks are removed

// Update playlist:
// 1. Get current playlist's tracks and sort by date of addition
// 2. Get recent tracks from that date onwards (max 99)
// 3. Add recent n tracks (max 99)
// 4. Remove oldest tracks from playlist (max 99)