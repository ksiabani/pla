const axios = require('axios');
const cheerio = require('cheerio');
const sleep = require('../../utils/sleep');

const scenarios = [
    {
        name: 'new liquid',
        url: 'https://www.beatport.com/genre/drum-and-bass/1/tracks?subgenre=5&per-page=150&page=',
        pagesToFollow: 1,
        parserFn: ($) => {
            return Array.from($('.bucket-item.ec-item.track'), el => {
                let styles = [];
                const mainTitle = $(el).data('ec-name');
                const artists = $(el).data('ec-d1').split(',');
                styles.push($(el).data('ec-d3'));
                if ($(el).data('ec-d4')) {
                    styles.push($(el).data('ec-d4'));
                }
                let remixTitle = $(el).find('.buk-track-remixed').text();
                if (remixTitle.toLowerCase() === 'original mix') {
                    remixTitle = ''
                }
                const title = remixTitle ? `${mainTitle} ${remixTitle}` : mainTitle;
                return {title, artists, styles, category: 'new'};
            });
        }
    },
    {
        name: 'new house',
        url: 'https://www.beatport.com/genre/house/5/tracks?per-page=150&page=',
        pagesToFollow: 1,
        parserFn: ($) => {
            return Array.from($('.bucket-item.ec-item.track'), el => {
                let styles = [];
                const mainTitle = $(el).data('ec-name');
                const artists = $(el).data('ec-d1').split(',');
                styles.push($(el).data('ec-d3'));
                if ($(el).data('ec-d4')) {
                    styles.push($(el).data('ec-d4'));
                }
                let remixTitle = $(el).find('.buk-track-remixed').text();
                if (remixTitle.toLowerCase() === 'original mix') {
                    remixTitle = ''
                }
                const title = remixTitle ? `${mainTitle} ${remixTitle}` : mainTitle;
                return {title, artists, styles, category: 'new'};
            });
        }
    },
    {
        name: 'new electronica / downtempo',
        url: 'https://www.beatport.com/tracks/all?type=Release&per-page=150&genres=3&page=1',
        pagesToFollow: 1,
        parserFn: ($) => {
            return Array.from($('.bucket-item.ec-item.track'), el => {
                let styles = [];
                const mainTitle = $(el).data('ec-name');
                const artists = $(el).data('ec-d1').split(',');
                styles.push($(el).data('ec-d3'));
                if ($(el).data('ec-d4')) {
                    styles.push($(el).data('ec-d4'));
                }
                let remixTitle = $(el).find('.buk-track-remixed').text();
                if (remixTitle.toLowerCase() === 'original mix') {
                    remixTitle = ''
                }
                const title = remixTitle ? `${mainTitle} ${remixTitle}` : mainTitle;
                return {title, artists, styles, category: 'new'};
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
                    console.log(`Running ${scenario.name} (${i} of ${scenario.pagesToFollow}) from Beatport`);
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
