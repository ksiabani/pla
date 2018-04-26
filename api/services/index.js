'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const Album = require('../models').Album;

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
    scrapMusic
};