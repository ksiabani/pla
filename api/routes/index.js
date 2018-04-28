'use strict';

const mainCtrl = require('../controllers');
const passport = require('passport');

module.exports = (app) => {

    app.route('/')
        .get((req, res) => {
            res.send({user: req.user});
        });

    app.route('/login')
        .get((req, res) => {
            res.send('Sorry friend, you must be logged in to do that.');
        });

    app.route('/auth/spotify')
        .get(passport.authenticate('spotify', {
            scope: ['user-read-email', 'user-read-private']
        }), (req, res) => {
            // this will never be called
        });

    app.route('/auth/spotify/callback')
        .get(passport.authenticate('spotify', {
            failureRedirect: '/login'
        }), (req, res) => {
            res.redirect('/');
        });

    app.route('/spotify')
        .get(mainCtrl.getArtistAlbums);

    app.route('/:provider/:genre/:category')
        .get(mainCtrl.ensureAuthenticated, mainCtrl.getMusic);

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

