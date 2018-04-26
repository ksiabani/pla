'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const Album = require('../models').Album;
const SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
const spotifyApi = new SpotifyWebApi({
    clientId : 'a521d27c6707473da14d2cc038ea942c',
    clientSecret : 'b2da3f96d90a4e8aa5595e435ef1e617',
    redirectUri : 'http://www.example.com/callback'
});

// Get Elvis' albums
spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE')
    .then(function(data) {
        console.log('Artist albums', data.body);
    }, function(err) {
        console.error(err);
    });

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
    spotifyApi
};