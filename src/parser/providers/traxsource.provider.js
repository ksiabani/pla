const axios = require('axios');
const cheerio = require('cheerio');
const sleep = require('../../utils/sleep');

const scenarios = [
    {
        name: 'Featured Electronica',
        url: 'https://www.traxsource.com/genre/5/electronica/featured?cn=tracks&ipp=100&gf=5&page=',
        pagesToFollow: 1,
        parserFn: ($) => {
            return Array.from($('.trk-row.play-trk'), el => {
                let styles = [];
                const mainTitle = $(el).find('.trk-cell.title a').text();
                let remixTitle = $(el).find('.trk-cell.title .version').clone().children().remove().end().text().replace(/\r?\n|\r/, '').trim();
                // TODO: This will return comma separated values, remove join if you want back an array
                const artists = Array.from($(el).find('.trk-cell.artists').find('.com-artists')).map(artist => $(artist).text());
                const genre = $(el).find('.trk-cell.genre a').text();
                if (remixTitle.toLowerCase() === 'original mix') {
                    remixTitle = ''
                }
                const title = remixTitle ? `${mainTitle} ${remixTitle}` : mainTitle;
                styles.push(genre);
                return {title, artists, styles, category: 'new'};
            });
        }
    },
    {
        name: 'Featured Soulful',
        url: 'https://www.traxsource.com/genre/24/soulful-house/featured?cn=tracks&ipp=100&gf=24&page=',
        pagesToFollow: 1,
        parserFn: ($) => {
            return Array.from($('.trk-row.play-trk'), el => {
                let styles = [];
                const mainTitle = $(el).find('.trk-cell.title a').text();
                let remixTitle = $(el).find('.trk-cell.title .version').clone().children().remove().end().text().replace(/\r?\n|\r/, '').trim();
                // TODO: This will return comma separated values, remove join if you want back an array
                const artists = Array.from($(el).find('.trk-cell.artists').find('.com-artists')).map(artist => $(artist).text());
                const genre = $(el).find('.trk-cell.genre a').text();
                if (remixTitle.toLowerCase() === 'original mix') {
                    remixTitle = ''
                }
                const title = remixTitle ? `${mainTitle} ${remixTitle}` : mainTitle;
                styles.push(genre);
                return {title, artists, styles, category: 'new'};
            });
        }
    },
    {
        name: 'Featured Deep',
        url: 'https://www.traxsource.com/genre/13/deep-house/featured?cn=tracks&ipp=100&gf=13&page=',
        pagesToFollow: 1,
        parserFn: ($) => {
            return Array.from($('.trk-row.play-trk'), el => {
                let styles = [];
                const mainTitle = $(el).find('.trk-cell.title a').text();
                let remixTitle = $(el).find('.trk-cell.title .version').clone().children().remove().end().text().replace(/\r?\n|\r/, '').trim();
                // TODO: This will return comma separated values, remove join if you want back an array
                const artists = Array.from($(el).find('.trk-cell.artists').find('.com-artists')).map(artist => $(artist).text());
                const genre = $(el).find('.trk-cell.genre a').text();
                if (remixTitle.toLowerCase() === 'original mix') {
                    remixTitle = ''
                }
                const title = remixTitle ? `${mainTitle} ${remixTitle}` : mainTitle;
                styles.push(genre);
                return {title, artists, styles, category: 'new'};
            });
        }
    },
    {
        name: 'DJ Top 10s Classics',
        url: 'https://www.traxsource.com/genre/13/deep-house/featured?cn=tracks&ipp=100&gf=13&page=',
        pagesToFollow: 4,
        parserFn: ($) => {
            return Array.from($('.trk-row.play-trk'), el => {
                let styles = [];
                const mainTitle = $(el).find('.trk-cell.title a').text();
                let remixTitle = $(el).find('.trk-cell.title .version').clone().children().remove().end().text().replace(/\r?\n|\r/, '').trim();
                // TODO: This will return comma separated values, remove join if you want back an array
                const artists = Array.from($(el).find('.trk-cell.artists').find('.com-artists')).map(artist => $(artist).text());
                const genre = $(el).find('.trk-cell.genre a').text();
                if (remixTitle.toLowerCase() === 'original mix') {
                    remixTitle = ''
                }
                const title = remixTitle ? `${mainTitle} ${remixTitle}` : mainTitle;
                styles.push(genre);
                return {title, artists, styles, category: 'new'};
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
                    console.log(`Running '${scenario.name}' (page ${i} of ${scenario.pagesToFollow}) from Traxsource`);
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
