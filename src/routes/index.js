// TODO: Put routes to separate files
const spotify = require('../controllers/spotify.controller');
const track = require('../controllers/track.controller');
const genre = require('../controllers/style.controller');

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
        .get(spotify.loginWithSpotify);

    //
    // Spotify

    app.route('/auth/spotify/callback')
        .get(spotify.setAccessToken);

    app.route('/spotify/me')
        .get(spotify.getSpotifyMe);

    app.route('/spotify/matcher')
        .get(spotify.matcher);

    app.route('/spotify/playlists')
        .get(spotify.getUserPlaylists);

    app.route('/spotify/updater')
        .get(spotify.updater);

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
