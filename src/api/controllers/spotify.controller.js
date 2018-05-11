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
        const meta = await Track.find({}).exec();
        let updated = 0;
        const options = {multi: true};
        for (let item of meta) {
            // TODO: Is searcher good with commas or should I remove them from artists names
            // TODO: Improve search, some tracks do contain original mix
            const query = {title: item.title, artist: item.artist};
            const track = await svc.spotify.searchTracks(`track:${item.title} artist:${item.artist}`, {limit: 1});
            const uri = track && track.body.tracks.items[0] && track.body.tracks.items[0].uri;
            const releaseDate = track && track.body.tracks.items[0] && track.body.tracks.items[0].album.release_date.split('-')[0];
            if (uri && releaseDate && releaseDate >= new Date().getFullYear()) {
                const response = await Track.update(query, {spotify_uri: uri}, options);
                if (response.nModified > 0) {
                    updated += response.nModified;
                }
            }
        }
        res.send(`${updated} tracks were updated`);

    }
    catch (error) {
        console.log(error);
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
        const playlistId = req.params.playlistId;
        const user = await spotify.getMe();
        const response = await spotify.getPlaylist(user.body.id, playlistId);
        res.send(response.body);
    }
    catch (error) {
        res.send(error.message);
    }
};

const updatePlaylist = async (req, res) => {
    try {
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