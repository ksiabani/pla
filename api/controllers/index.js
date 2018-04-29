'use strict';

const svc = require('../services');

const getMeta = async (req, res) => {
    try {
        const response = await svc.scrapMusic(req);
        res.send(response);
    } catch(error) {
        res.send(error)
    }
};

const getArtistAlbums = async (req, res) => {
    try {
        const response = await svc.spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE');
        res.send(response.body);
    } catch(error) {
        res.send(error.message);
    }
};

const getSpotifyMe = async(reg, res) => {
    try {
        const response = await svc.spotify.getMe();
        res.send(response.body);
    } catch(error) {
        res.send(error.message);
    }
};

const loginWithSpotify = (req, res) => {
    res.redirect(svc.authorizeURL);
};

const setAccessToken = (req, res) => {

    const code = req.query.code;
    svc.spotify.authorizationCodeGrant(code).then(
        function(data) {
            console.log('The token expires in ' + data.body['expires_in']);
            console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);

            // Set the access token on the API object to use it in later calls
            svc.spotify.setAccessToken(data.body['access_token']);
            svc.spotify.setRefreshToken(data.body['refresh_token']);
            res.redirect('/');
        },
        function(err) {
            console.log('Something went wrong!', err);
        }
    );

};


// const spotify = (async () => {
//     const code = await svc.getAuthorizationCode();
//     const addMusic = async (req, res) => {
//         try {
//             const albums = await svc.scrapMusic(req);
//             res.send(albums);
//         } catch(error) {
//             res.send(error);
//         }
//     };
//     return {
//         code: code(), addMusic: addMusic()
//     };
// })();

const addMusic = async (req, res) => {
    try {
        // const code = await svc.getAuthorizationCode();
        // const albums = await svc.scrapMusic(req);
        // res.send(code);
    } catch(error) {
        res.send(error);
    }
};



// const ensureAuthenticated = (req, res, next) => {
//     if (req.isAuthenticated()) { return next(); }
//     res.redirect('/login');
// };

module.exports = {
    getMeta,
    getArtistAlbums,
    addMusic,
    loginWithSpotify,
    setAccessToken,
    getSpotifyMe
};

// Flow:
// 1: Request an endpoint
// 2: if access denied redirect to authorizeurl