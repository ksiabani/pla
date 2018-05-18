const axios = require('axios');
const cheerio = require('cheerio');
const sleep = require('../../utils/sleep');

const scenarios = [
    {
        name: 'featured electronica',
        url: 'https://www.traxsource.com/genre/5/electronica/featured?cn=tracks&ipp=100&gf=5&ob=r_date&so=desc&page=',
        pagesToFollow: 1,
        parserFn: ($) => {
            return Array.from($('.trk-row.play-trk'), el => {
                let styles = [];
                const mainTitle = $(el).find('.trk-cell.title a').text();
                let remixTitle = $(el).find('.trk-cell.title .version').clone().children().remove().end().text().replace(/\r?\n|\r/, '').trim();
                // TODO: This will return comma separated values, remove join if you want back an array
                const artist = Array.from($(el).find('.trk-cell.artists').find('.com-artists')).map(artist => $(artist).text()).join(',');
                const genre = $(el).find('.trk-cell.genre a').text();
                if (remixTitle.toLowerCase() === 'original mix') {
                    remixTitle = ''
                }
                const title = remixTitle ? `${mainTitle} ${remixTitle}` : mainTitle;
                styles.push(genre);
                return {title, artist, styles, category: 'new'};
            });
        }
    }
];

class Traxsource {
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
                    console.log(`Running ${scenario.name} (${i} of ${scenario.pagesToFollow}) from Traxsource`);
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

module.exports = Traxsource;