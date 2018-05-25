// TODO: Put routes to separate files
const spotify = require('../controllers/spotify.controller');
const track = require('../controllers/track.controller');
const genre = require('../controllers/style.controller');
const config = require('../config/index');
const spotifyService = require('../services/spotify.service');
const Track = require('../models/track.model');

module.exports = (app) => {

    //
    // Basic stuff

    app.route('/')
        .get((req, res) => {
            res.send(';-)');
        });

    //
    // Auth

    app.route('/auth/spotify')
        .get((req, res) => spotify.loginWithSpotify(req, res, config, spotifyService));

    app.route('/auth/spotify/callback')
        .get((req, res) => spotify.setAccessToken(req, res, spotifyService));

    //
    // Spotify

    app.route('/spotify/me')
        .get((req, res) => spotify.getSpotifyMe(req, res, spotifyService));

    app.route('/spotify/playlists')
        .get((req, res) => spotify.getUserPlaylists(req, res, spotifyService));

    app.route('/spotify/matcher')
        .get((req, res) => spotify.matcher(req, res, spotifyService, Track, false));

    app.route('/spotify/retromatcher')
        .get((req, res) => spotify.matcher(req, res, spotifyService, Track, true));

    app.route('/spotify/picker')
        .get((req, res) => spotify.picker(req, res, config, spotifyService, Track));

    app.route('/spotify/curator')
        .get((req, res) => spotify.curator(req, res, config, spotifyService, Track));

    //
    // API
    //

    //
    // Track

    app.route('/api/tracks')
        .get(track.list);

    // app.route('/tracks/:trackId').get(Track.get);
    // app.route('/tracks').post(Track.post);
    // app.route('/tracks/:trackId').put(Track.put);
    // app.route('/tracks/:trackId').delete(Track.remove);


    //
    // Styles

    app.route('/api/styles')
        .get(genre.list);

    // app.route('/api/styles/:styleId/tracks')
    //     .get(genre.tracks);


    //
    // 404
    app.use((req, res) => {
        res.status(404)
            .send({url: `URL ${req.originalUrl} not found`});
    });

};
