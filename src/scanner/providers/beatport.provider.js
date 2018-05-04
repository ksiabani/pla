const axios = require('axios');
const cheerio = require('cheerio');

const scenarios = [
    {
        name: 'new',
        url: 'https://www.beatport.com/tracks/all?per-page=150',
        parserFn: ($) => {
            return Array.from($('.bucket-item.ec-item.track'), el => {
                const mainTitle = $(el).data('ec-name').trim();
                const artist = $(el).data('ec-d1').trim();
                const style = $(el).data('ec-d3').trim();
                let remixTitle = $(el).find('.buk-track-remixed').text().trim();
                if (remixTitle.toLowerCase() === 'original mix') {
                    remixTitle = ''
                }
                const title = remixTitle ? `${mainTitle} ${remixTitle}` : mainTitle;
                return {title, artist, style, category: 'new'};
            });
        }
    }
];

class Beatport {
    constructor() {
    }

    async parser() {
        try {
            let meta = [];
            for (let scenario of scenarios) {
                const url = scenario.url;
                const response = await axios.get(url);
                const $ = cheerio.load(response.data);
                const tracks = scenario.parserFn($);
                meta = [...meta, ...tracks];
            }
            return meta;
        }
        catch (error) {
            return error;
        }

    }
}

module.exports = Beatport;
