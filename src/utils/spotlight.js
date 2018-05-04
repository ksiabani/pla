'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
// const Track = require('../models').Track;

const urls = {
    traxsource: {
        new: 'https://www.traxsource.com/genre/4/house/featured?cn=tracks&ipp=100&gf=4&ob=r_date&so=desc',
        top: 'https://www.traxsource.com/genre/4/house/top?cn=tracks&gf=4'
    },
    beatport: {
        new: 'https://www.beatport.com/tracks/all?per-page=150',
        top: ''
    }
};

class Traxsource {

    constructor() {
    }

    scrapper(html) {
        const $ = cheerio.load(html);
        let tracks = [];
        $('.trk-row.play-trk').each((idx, el) => {
            // const artist = $(el).clone().children().remove().end().text().replace(/\r?\n|\r/, '').trim();
            // const title = $(el).children().first().text();
            const mainTitle = $(el).find('.trk-cell.title').children().first().text().trim();
            let remixTitle = $(el).find('.trk-cell.title .version').clone().children().remove().end().text().replace(/\r?\n|\r/, '').trim();
            if (remixTitle.toLowerCase() === 'original mix') {
                remixTitle = ''
            }
            const artist = $(el).find('.trk-cell.artists').children().first().text().trim();
            const title = remixTitle ? `${mainTitle} ${remixTitle}` : mainTitle;
            tracks.push(new Track(title, artist));
        });
        return tracks;
    }
}

class Beatport {

    constructor() {}

    async scrapNew() {
        try {
            const url = urls.beatport.new;
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
            return tracks;
        }
        catch(error) {
            return error;
        }
    }

    async scrapper() {
        try {
            const scrapped = await this.scrapNew();
            return scrapped;
        }
        catch(error) {
            return error;
        }
    }
}

const providers = {
    // traxsource: Traxsource,
    bearport: Beatport
};

const scrapMeta = async () => {
    try {
        let meta = [];
        for (let key in providers) {
            const provider = new providers[key];
            const scrapped = await provider.scrapper();
            meta = [...meta, ...scrapped];
        }
        console.log(meta);
    } catch (error) {
        return error;
    }
};


scrapMeta()





// scrapMeta();

module.exports = {
    scrapMeta,
    urls
};


// How to use providers sort of like dependencies
//
// class Traxsource {
//     constructor() {}
//
//     sayMyName() {
//         console.log('My name is Traxsource');
//     }
// }
//
// class Beatport {
//     constructor() {}
//
//     sayMyName() {
//         console.log('My name is Beatport');
//     }
// }
//
// const providers = {
//     traxsource: Traxsource,
//     bearport: Beatport
// }
//
// for (let key in providers) {
//     const provider = new providers[key];
//     provider.sayMyName();
// }

