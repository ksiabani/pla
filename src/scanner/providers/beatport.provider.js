const axios = require('axios');
const cheerio = require('cheerio');
const sleep = require('../../utils/sleep');

const scenarios = [
    {
        name: 'new',
        url: 'https://www.beatport.com/tracks/all?per-page=150&page=',
        pagesToFollow: 15,
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
                for (let i = 1; i <= scenario.pagesToFollow; i++) {
                    const url = `${scenario.url}${i}`;
                    const response = await axios.get(url);
                    const $ = cheerio.load(response.data);
                    const tracks = scenario.parserFn($);
                    meta = [...meta, ...tracks];
                    console.log(url);
                    await sleep(10000);
                }
            }
            return meta;
        }
        catch (error) {
            console.log(error);
        }

    }
}

module.exports = Beatport;
