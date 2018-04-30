'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const Track = require('../models').Track;
const SpotifyWebApi = require('spotify-web-api-node');

const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read'
];
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

const scrapMeta = async (req) => {
    try {
        const genre = req.params.genre;
        const category = req.params.category;
        const provider = req.params.provider;
        const url = urls[provider][genre][category];
        switch (provider) {
            case 'traxsource':
                const response = await axios.get(url);
                const traxsource = new Traxsource();
                return traxsource.scrapper(response.data);
            default:
                return;
        }
    } catch (error) {
        return error;
    }
};

class Traxsource {
    constructor() {}

    scrapper(html){
        const $ = cheerio.load(html);
        let tracks = [];
        $('.trk-row.play-trk').each((idx, el) => {
            // const artist = $(el).clone().children().remove().end().text().replace(/\r?\n|\r/, '').trim();
            // const title = $(el).children().first().text();
            const mainTitle = $(el).find('.trk-cell.title').children().first().text().trim();
            let remixTitle = $(el).find('.trk-cell.title .version').clone().children().remove().end().text().replace(/\r?\n|\r/, '').trim();
            if (remixTitle === 'Original Mix') { remixTitle = ''}
            const artist = $(el).find('.trk-cell.artists').children().first().text().trim();
            tracks.push(new Track(`${mainTitle} ${remixTitle}`, artist));
        });
        return tracks;
    }
}

const urls = {
    traxsource: {
        house: {
            new: "https://www.traxsource.com/genre/4/house/featured?cn=tracks&ipp=100&gf=4&ob=r_date&so=desc",
            top: "https://www.traxsource.com/genre/4/house/top?cn=tracks&gf=4"
        },
        "soulful-house": {
            new: "",
            top: ""
        }
    }
};

module.exports = {
    scrapMeta,
    spotify,
    authorizeURL
};