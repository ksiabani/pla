'use strict';

const svc = require('../services');

const getMusic = async (req, res) => {
    const genre = req.params.genre;
    const category = req.params.category;
    const provider = req.params.provider;
    const url = urls[provider][genre][category];
    const response = await svc.scrapMusic(provider, category, url);
    res.send(response);
};

const getArtistAlbums = async (req, res) => {
    const response = await svc.spotifyApi.getArtistAlbums();
    res.send(response);
};

const urls = {
    traxsource: {
        house: {
            latest: "https://www.traxsource.com/genre/4/house/all?cn=titles&ipp=10&period=today",
            popular: "https://www.traxsource.com/genre/4/house/top"
        },
        "soulful-house": {
            latest: "",
            popular: ""
        }
    }
};

module.exports = {
    getMusic,
    getArtistAlbums
};