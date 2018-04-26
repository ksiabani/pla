'use strict';

const http = require('http');
const axios = require('axios');
const cheerio = require('cheerio');
const TaxRate = require('../models').TaxRate;

const scrapeTaxRates = (state, url, cb) => {
    http.get(url, (res) => {
        let html = '';

        res.on('data', chunk => {
            html += chunk;
        });

        res.on('end', () => {
            const parser = new Parser(state);
            const rates = parser.parse(html);
            cb(rates);
        });
    });
};

const scrapTracks = async (url) => {
    try {
        const response = await axios.get(url);
        const scraper = new Scraper();
        return scraper.scrap(response.data);
    } catch (error) {
        return error;
    }
};

class Scraper {
    constructor() {
    }

    scrap(html) {
        const $ = cheerio.load(html);
        let albums = [];
        $('.links.ellip').each((idx, el) => {
            albums.push({
                title: $(el).first().text(),
                album: $(el).text()
            });
        });
        return albums;
    }
}

class Parser {
    constructor(state) {
        this.state = state;
    }

    parse(html) {
        switch (this.state.toLowerCase()) {
            case 'nebraska':
                return this.parseNebraska(html);
            default:
                return null;
        }
    }

    parseNebraska(html) {
        const $ = cheerio.load(html);
        let rates = [];
        $('tr').each((idx, el) => {
            const cells = $(el).children('td');
            if (cells.length === 5 && !$(el).attr('bgcolor')) {
                const rawData = {
                    city: $(cells[0]).first().text(),
                    cityRate: $(cells[1]).first().text(),
                    totalRate: $(cells[2]).first().text()
                };
                rawData.cityRate = parseFloat(rawData.cityRate.replace('%', '')) / 100;
                rawData.totalRate = parseFloat(rawData.totalRate.substr(0, rawData.totalRate.indexOf('%'))) / 100;
                rawData.stateRate = rawData.totalRate - rawData.cityRate;
                rates.push(new TaxRate('Nebraska', rawData.city, rawData.cityRate, rawData.stateRate));
            }
        });
        return rates;
    }
}

module.exports = {
    scrapeTaxRates,
    scrapTracks
};