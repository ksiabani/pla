'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const Album = require('../models').Album;
const SpotifyWebApi = require('spotify-web-api-node');

const scopes = ['user-read-private', 'user-read-email'];
const redirectUri = 'http://localhost:3500/auth/spotify/callback/';
const clientId = 'a521d27c6707473da14d2cc038ea942c';
// const state = 'some-state-of-my-choice';
const clientSecret = 'b2da3f96d90a4e8aa5595e435ef1e617';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotify = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret
});

// Create the authorization URL
const authorizeURL = spotify.createAuthorizeURL(scopes);


// const spotify = new SpotifyWebApi({
//     clientId: 'a521d27c6707473da14d2cc038ea942c',
//     redirectUri: 'http://localhost:3500/auth/spotify/callback/',
//     clientSecret : 'b2da3f96d90a4e8aa5595e435ef1e617'
// });
//
// const authorizeURL = spotify.createAuthorizeURL(['user-read-private', 'user-read-email']);
// console.log(authorizeURL);

// axios.get(authorizeURL).then(response => {
//     return;
    // const code = response.headers['set-cookie'][0].split(';')[0].split('=')[1];
    // console.log(response);
    // spotify.authorizationCodeGrant(code).then(
    //     function(data) {
    //         console.log('The token expires in ' + data.body['expires_in']);
    //         console.log('The access token is ' + data.body['access_token']);
    //         console.log('The refresh token is ' + data.body['refresh_token']);
    //
    //         // Set the access token on the API object to use it in later calls
    //         spotifyApi.setAccessToken(data.body['access_token']);
    //         spotifyApi.setRefreshToken(data.body['refresh_token']);
    //     },
    //     function(err) {
    //         console.log('Something went wrong!', err);
    //     }
    // );
// });




// (async () => {
//     const code = await getAuthorizationCode();
//     console.log(code);
// })();








// clientSecret : 'b2da3f96d90a4e8aa5595e435ef1e617'

// spotifyApi.setAccessToken()
//
// const credentials = await svc.spotifyApi.clientCredentialsGrant();
// await svc.spotifyApi.setAccessToken(credentials.body['access_token']);

// spotifyApi.clientCredentialsGrant().then(
//     function(data) {
//         console.log('The access token expires in ' + data.body['expires_in']);
//         console.log('The access token is ' + data.body['access_token']);
//
//         // Save the access token so that it's used in future calls
//         spotifyApi.setAccessToken(data.body['access_token']);
//     },
//     function(err) {
//         console.log('Something went wrong when retrieving an access token', err);
//     }
// );

const scrapMusic = async (req) => {
    try {
        const genre = req.params.genre;
        const category = req.params.category;
        const provider = req.params.provider;
        const url = urls[provider][genre][category];
        switch (provider) {
            case 'traxsource':
                const response = await axios.get(url);
                const traxsource = new Traxsource(category);
                return traxsource.scrap(response.data);
            default:
                return;
        }
    } catch (error) {
        return error;
    }
};

class Traxsource {
    constructor(category) {
        this.category = category;
    }

    scrap(html) {
        switch (this.category) {
            case 'latest':
                return this.getAlbumsFromTraxsource(html);
            default:
                return;
        }
    }

    getAlbumsFromTraxsource(html) {
        const $ = cheerio.load(html);
        let albums = [];
        $('.links.ellip').each((idx, el) => {
            const artist = $(el).clone().children().remove().end().text().replace(/\r?\n|\r/, '').trim();
            const title = $(el).children().first().text();
            albums.push(new Album(title, artist));
        });
        return albums;
    }
}

const urls = {
    traxsource: {
        house: {
            latest: "https://www.traxsource.com/genre/4/house/all?cn=titles&ipp=10&period=today",
            popular: "https://www.traxsource.com/genre/4/house/top"
        },
        "soulful-house": {
            latest: "",
            popular: ""
        }
    }
};

module.exports = {
    scrapMusic,
    spotify,
    authorizeURL
};