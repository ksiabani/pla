'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const Album = require('../models').Album;
const SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
// const spotifyApi = new SpotifyWebApi({
//     clientId : 'a521d27c6707473da14d2cc038ea942c',
//     clientSecret : 'b2da3f96d90a4e8aa5595e435ef1e617',
//     redirectUri: 'http://localhost:3500/spotify/callback'
// });

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

const scrapMusic = async (provider, category, url) => {
    try {
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

module.exports = {
    scrapMusic,
    // spotifyApi
};