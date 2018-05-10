const SpotifyWebApi = require('spotify-web-api-node');
const redirectUri = 'http://localhost:3500/auth/spotify/callback/';
const clientId = 'a521d27c6707473da14d2cc038ea942c';
// const state = 'some-state-of-my-choice';
const clientSecret = 'b2da3f96d90a4e8aa5595e435ef1e617';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotify = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret
    // showDialog: true // This doesn't seem to work
});

module.exports = spotify;
