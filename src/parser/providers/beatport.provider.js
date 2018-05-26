const axios = require('axios');
const cheerio = require('cheerio');
const sleep = require('../../utils/sleep');
const root = 'https://www.beatport.com';

const scenarios = [
    {
        name: 'New Liquid',
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
        name: 'New Electronica / Downtempo',
        url: 'https://www.beatport.com/tracks/all?type=Release&per-page=150&genres=3&page=',
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
        name: 'Featured Latest House',
        url: 'https://www.beatport.com/genre/house/5',
        parserFn: ($) => {
            return Array.from($('.bucket-item.ec-item.release'), el => {
                return $(el).find('.release-artwork-parent').attr('href');
            });
        },
        scenarioToFollow: {
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
    }
];

class Beatport {
    constructor() {
    }

    async parser() {
        try {
            let meta = [];
            for (let scenario of scenarios) {

                // Scenario has pagination
                if (scenario.pagesToFollow) {
                    for (let i = 1; i <= scenario.pagesToFollow; i++) {
                        const url = `${scenario.url}${i}`;
                        const response = await axios.get(url);
                        const $ = cheerio.load(response.data);
                        const tracks = scenario.parserFn($);
                        meta = [...meta, ...tracks];
                        console.log(`Running '${scenario.name}' (page ${i} of ${scenario.pagesToFollow}) from Beatport`);
                        await sleep(10000);
                    }
                }

                // Scenario has follow up scenario
                if (scenario.scenarioToFollow) {
                    const url = `${scenario.url}`;
                    const response = await axios.get(url);
                    const $ = cheerio.load(response.data);
                    const followUpUrls = scenario.parserFn($);
                    for (let i = 0; i < followUpUrls.length; i++) {
                        const url = root + followUpUrls[i];
                        const response = await axios.get(url);
                        const $ = cheerio.load(response.data);
                        const tracks = scenario.scenarioToFollow.parserFn($);
                        meta = [...meta, ...tracks];
                        console.log(`Running '${scenario.name}' (with follow ups) from Beatport`);
                        await sleep(10000);
                    }
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
