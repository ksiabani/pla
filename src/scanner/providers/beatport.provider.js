'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const scenarios = [
    {
        name: 'new',
        url: 'https://www.beatport.com/tracks/all?per-page=150',

        // containerEl: '.buk-track-meta-parent',
        // titleEl: '.buk-track-primary-title',
        // remixEl: '.buk-track-remixed',
        // artistEl: '',
        // tagEl: ''
    }
];

class Beatport {
    constructor() {}

    async parser() {
        try {
            let meta = [];
            for (let scenario of scenarios){
                const url = scenario.url;
                const response = await axios.get(url);
                const $ = cheerio.load(response);
                let tracks = [];
                $('.bucket-item.ec-item.track').each((idx, el) => {
                    const mainTitle = $(el).data('ec-name').trim();
                    const artist = $(el).data('ec-d1').trim();
                    let remixTitle = $(el).find('.buk-track-remixed').text().trim();
                    if (remixTitle.toLowerCase() === 'original mix') {
                        remixTitle = ''
                    }
                    const title = remixTitle ? `${mainTitle} ${remixTitle}` : mainTitle;
                    tracks.push(new Track(title, artist));
                });
                meta = [...meta, ...tracks];
            }
            return meta;
        }
        catch(error) {
            return error;
        }

    }
}

module.exports = Beatport;