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

    app.route('/auth/spotify/callback')
        .get(spotify.setAccessToken);

    //
    // Spotify

    app.route('/spotify/me')
        .get(spotify.getSpotifyMe);

    app.route('/spotify/playlists')
        .get(spotify.getUserPlaylists);

    app.route('/spotify/matcher')
        .get((req, res) => spotify.matcher(req, res, false));

    app.route('/spotify/retromatcher')
        .get((req, res) => spotify.matcher(req, res, true));

    app.route('/spotify/picker')
        .get(spotify.picker);

    app.route('/spotify/curator')
        .get(spotify.curator);

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
