// TODO: Put routes to separate files

const spotify = require('../controllers/spotify.controller');
const track = require('../controllers/track.controller');

module.exports = (app) => {

    //
    // Basic stuff

    app.route('/')
        .get((req, res) => {
            res.send('You are home now friend.');
        });

    app.route('/login')
        .get((req, res) => {
            res.send('Sorry friend, you must be logged in to do that.');
        });

    //
    // Auth

    app.route('/auth/spotify')
        .get(spotify.loginWithSpotify);

    //
    // Spotify

    app.route('/auth/spotify/callback')
        .get(spotify.setAccessToken);

    // app.route('/spotify')
    //     .get(spotify.getArtistAlbums);

    app.route('/spotify/me')
        .get(spotify.getSpotifyMe);

    app.route('/spotify/matcher')
        .get(spotify.matcher);

    app.route('/spotify/playlists')
        .get(spotify.getUserPlaylists);

    app.route('/spotify/playlists/:playlistId')
        .get(spotify.getPlaylist)
        .put(spotify.updatePlaylist);

    //
    // Track

    app.route('/tracks').get(track.list);
    // app.route('/tracks/:trackId').get(Track.get);
    // app.route('/tracks').post(Track.post);
    // app.route('/tracks/:trackId').put(Track.put);
    // app.route('/tracks/:trackId').delete(Track.remove);

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

