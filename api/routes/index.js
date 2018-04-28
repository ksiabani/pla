'use strict';

const mainCtrl = require('../controllers');
const passport = require('passport');

module.exports = (app) => {

    app.use([
        '/calculate/:stateName/:cityName/:amount'
    ], (req, res, next) => {
        next();
    });

    // app.route('/:provider/:genre/:category')
    //     .get(mainCtrl.getMusic);

    app.route('/spotify')
        .get(mainCtrl.getArtistAlbums);

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

