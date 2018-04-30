'use strict';

const svc = require('../services');

const getMeta = async (req, res) => {
    try {
        const response = await svc.scrapMeta(req);
        res.send(response);
    } catch (error) {
        res.send(error)
    }
};

const getArtistAlbums = async (req, res) => {
    try {
        const response = await svc.spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE');
        res.send(response.body);
    } catch (error) {
        res.send(error.message);
    }
};

const getSpotifyMe = async (reg, res) => {
    try {
        const response = await svc.spotify.getMe();
        res.send(response.body);
    } catch (error) {
        res.send(error.message);
    }
};

const loginWithSpotify = (req, res) => {
    res.redirect(svc.authorizeURL);
};

const setAccessToken = (req, res) => {

    const code = req.query.code;
    svc.spotify.authorizationCodeGrant(code).then(
        function (data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);

            // Set the access token on the API object to use it in later calls
            svc.spotify.setAccessToken(data.body['access_token']);
            svc.spotify.setRefreshToken(data.body['refresh_token']);
            res.redirect('/');
        },
        function (err) {
            console.log('Something went wrong!', err);
        }
    );

};

const addMusic = async (req, res) => {
    try {
        const meta = await svc.scrapMeta(req);
        const genre = req.params.genre;
        const category = req.params.category;
        const uris = [];
        for (let item of meta) {
            const track = await svc.spotify.searchTracks(`track:${item.title} artist:${item.artist}`, {limit: 1});
            const uri = track.body.tracks.items[0] && track.body.tracks.items[0].uri;
            const releaseDate = track.body.tracks.items[0] && track.body.tracks.items[0].album.release_date.split('-')[0];
            if (uri && releaseDate && releaseDate >= new Date().getFullYear()) {
                uris.push(uri);
            }
        }
        await svc.spotify.removeTracksFromPlaylist('ksiabani', playlistUris[genre][category], uris.map(uri=> ({"uri": uri})));
        await svc.spotify.addTracksToPlaylist('ksiabani', playlistUris[genre][category], uris);
        res.send(`${uris.length} tracks added to playlist`);
    } catch (error) {
        res.send(error);
    }
};

const playlistUris = {
    house: {
        new: '6WlLThhqhYLtivKnlBALC8',
        top: ''
    },
    electronica: {
        new: '7uIhCfXZlwnKlH0wMoyFce',
        top: ''
    }
};

module.exports = {
    getMeta,
    getArtistAlbums,
    addMusic,
    loginWithSpotify,
    setAccessToken,
    getSpotifyMe
};

// Playlist rules:
// * Max no of track is 99
// * No duplicates
// * No collections
// * When newer tracks are added older tracks are removed