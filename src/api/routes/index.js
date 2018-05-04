'use strict';

const mainCtrl = require('../controllers');

module.exports = (app) => {

    app.route('/')
        .get((req, res) => {
            res.send('You are home now friend.');
        });

    app.route('/login')
        .get((req, res) => {
            res.send('Sorry friend, you must be logged in to do that.');
        });

    app.route('/auth/spotify')
        .get(mainCtrl.loginWithSpotify);

    app.route('/auth/spotify/callback')
        .get(mainCtrl.setAccessToken);

    // app.route('/spotify')
    //     .get(mainCtrl.getArtistAlbums);

    // app.route('/spotify/me')
    //     .get(mainCtrl.getSpotifyMe);

    // app.route('/:provider/:genre/:category')
    //     .get(mainCtrl.getMeta);

    app.route('/library/:genre/:category')
        .get(mainCtrl.addMusic);

    app.use((req, res) => {
        res.status(404)
            .send({url: `sorry friend, but url ${req.originalUrl} is not found`});
    });

};

// Routes (traxsource)- new releases and top tracks:
// Tech house - New releases: traxsource/tech-house/latest
// Soulful House - Top tracks: traxsource/soulful-house/popular

// Routes (library) - Library actions
// Add latest house albums - library/traxsource/house/latest
// Create top 10 in all genres - library/traxsource/all/popular

