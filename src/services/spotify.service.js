const SpotifyWebApi = require('spotify-web-api-node');
const redirectUri = process.env.SPOTIFY_REDIRECTURI;
const clientId = process.env.SPOTIFY_CLIENTID;
// const state = 'some-state-of-my-choice';
const clientSecret = process.env.SPOTIFY_CLIENTSECRET;

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotify = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret
    // showDialog: true // This doesn't seem to work
});

module.exports = spotify;
