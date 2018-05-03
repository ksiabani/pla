'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const Track = require('../models').Track;
const SpotifyWebApi = require('spotify-web-api-node');

const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read'
];
const redirectUri = 'http://localhost:3500/auth/spotify/callback/';
const clientId = 'a521d27c6707473da14d2cc038ea942c';
// const state = 'some-state-of-my-choice';
const clientSecret = 'b2da3f96d90a4e8aa5595e435ef1e617';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotify = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret
});

// Create the authorization URL
const authorizeURL = spotify.createAuthorizeURL(scopes);

const scrapMeta = async (req) => {
    try {
        const genre = req.params.genre;
        const category = req.params.category;
        // const traxsource = new Traxsource();
        const provider = new Beatport();
        // const traxsourceUrl = urls.traxsource[genre][category];
        const url = urls.beatport[genre][category];
        // const traxsourceReponse = await axios.get(traxsourceUrl);
        const response = await axios.get(url);
        // return traxsource.scrapper(traxsourceReponse.data)
        //     .concat(beatport.scrapper(beatportResponse.data));
        return provider.scrapper(response.data);
    } catch (error) {
        return error;
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

    constructor() {
    }

    scrapper(html) {
        const $ = cheerio.load(html);
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
}

const urls = {
    traxsource: {
        house: {
            new: 'https://www.traxsource.com/genre/4/house/featured?cn=tracks&ipp=100&gf=4&ob=r_date&so=desc',
            top: 'https://www.traxsource.com/genre/4/house/top?cn=tracks&gf=4'
        },
        electronica: {
            new: 'https://www.traxsource.com/genre/5/electronica/featured?cn=tracks&ipp=100&gf=5&ob=r_date&so=desc',
            top: 'https://www.traxsource.com/genre/5/electronica/top?cn=tracks&gf=5'
        },
        liquid: {
            new: 'https://www.traxsource.com/genre/2/broken-beat-nu-jazz/all?cn=tracks&ipp=100&gf=2&ob=default&so=desc'
        }
    },
    beatport: {
        house: {
            new: 'https://www.beatport.com/genre/house/5/tracks?per-page=150&sort=release-desc&page=2',
            top: ''
        },
        electronica: {
            new: '',
            top: ''
        },
        liquid: {
            new: 'https://www.beatport.com/genre/drum-and-bass/1/tracks?subgenre=5&per-page=150',
            top: ''
        }
    }
};


module.exports = {
    scrapMeta,
    spotify,
    authorizeURL
};