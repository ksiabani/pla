const config = require('../config/index');
const spotify = require('../services/spotify.service');
const Track = require('../models/track.model');

const getSpotifyMe = async (reg, res) => {
    try {
        const response = await spotify.getMe();
        res.json(response.body);
    } catch (error) {
        res.send(error.message);
    }
};

const loginWithSpotify = (req, res) => {
    res.redirect(spotify.createAuthorizeURL(config.spotify.scopes));
};

const setAccessToken = async (req, res) => {
    try {
        const code = req.query.code;
        const response = await spotify.authorizationCodeGrant(code);
        spotify.setAccessToken(response.body['access_token']);
        spotify.setRefreshToken(response.body['refresh_token']);
        const me = await spotify.getMe();
        res.send(me.body);
    }
    catch (error) {
        res.send(error)
    }
};

// TODO: Create retromatcher that will pick a 100 random records that have been scanned but not matched

const matcher = async (req, res) => {
    try {
        // Get tracks that don't have a uri, limit to 100 to avoid limit rate
        const meta = await Track.find({spotify_uri: null, lastScannedAt: null}, {}, {lean: true}).limit(100).exec();
        let updated = 0;
        const options = {multi: true};
        // Use slice to prevent limit rates
        for (let item of meta) {
            // TODO: Improve search, some tracks do contain original mix
            const query = {title: item.title, artists: item.artists};
            const searchPhrase = `track:${item.title} artist:${item.artists.join(' ')}`;
            const track = await spotify.searchTracks(searchPhrase, {limit: 1});
            const uri = track && track.body.tracks.items[0] && track.body.tracks.items[0].uri;
            const releaseDate = track && track.body.tracks.items[0] && track.body.tracks.items[0].album.release_date.split('-')[0];
            // Let's trust Spotify and not check release date. Also for classics this will not work
            // TODO: Check if this works
            // if (uri && releaseDate && releaseDate >= new Date().getFullYear()) {
            if (uri) {
                const response = await Track.update(query, {spotify_uri: uri}, options);
                if (response.nModified > 0) {
                    updated += response.nModified;
                }
            }
            // Update last scanned date on each track that a search was performed on
            await Track.update(query, {lastScannedAt: new Date()}, options);
        }
        res.send(`${updated} tracks were matched`);

    }
    catch (error) {
        console.log(error);
        res.send(error.message);
    }
};

const getUserPlaylists = async (req, res) => {
    try {
        const user = await spotify.getMe();
        const response = await spotify.getUserPlaylists(user.body.id);
        res.json(response.body);
    }
    catch (error) {
        res.send(error.message);
    }

};

const updater = async (req, res) => {
    try {
        let text = '';
        for (let details of config.playlists.picked.new) {

            const user = await spotify.getMe();
            const userId = user.body.id;
            const playlistId = details.id;
            const style = details.style;
            const playlist = await spotify.getPlaylist(userId, playlistId);
            const name = playlist.body.name;
            let tracks = playlist.body.tracks.items;
            text += `Updating '${name}'\n`;
            text += `--\n`;
            text += `'${name}' has ${tracks.length} tracks.\n`;

            // Sort playlist tracks by date ascending
            if (tracks.length) {
                tracks.sort((a, b) => {
                    if (new Date(a.added_at) > new Date(b.added_at)) {
                        return 1;
                    }
                    if (new Date(a.added_at) < new Date(b.added_at)) {
                        return -1;
                    }
                    if (new Date(a.added_at).getTime() === new Date(b.added_at).getTime()) {
                        return 0;
                    }
                });
            }

            // Find tracks (for the style in question), that have been matched
            // but never added to a playlist, sorted by createdAt date (most recent first)
            const query = {spotify_uri: {$ne: null}, lastAddedAt: null, styles: style};
            const matchedNotAdded = await Track.find(query, {}, {lean: true}).sort({createdAt: 'desc'}).exec();
            const tracksToAdd = matchedNotAdded.slice(0, 99); //get the 100 latest tracks
            const tracksToAddUris = tracksToAdd.map(track => track.spotify_uri);

            if (matchedNotAdded.length) {
                text += `${matchedNotAdded.length} tracks were recently matched.\n`;


                // If playlist has any tracks
                if (tracks.length) {
                    // Get the tracks to remove from the playlist
                    // Tracks to remove = (existing tracks + tracks to add) - max number of playlist tracks
                    const tracksToRemoveCount = (tracksToAdd.length + tracks.length) - 99;
                    const tracksToRemoveUris =
                        tracksToRemoveCount < 0 ?
                            null : // no tracks to remove
                            tracks.slice(0, tracksToRemoveCount).map(track => {
                                return {uri: track.track.uri}
                            });

                    // Remove tracks from playlist
                    if (tracksToRemoveUris && tracksToRemoveUris.length) {
                        await spotify.removeTracksFromPlaylist(userId, playlistId, [...tracksToRemoveUris]);
                        text += `${tracksToRemoveUris.length} tracks were removed.\n`;
                    }
                }

                // Add tracks to playlist, then update lastAddedAt for each track in database
                if (tracksToAddUris && tracksToAddUris.length) {
                    await spotify.addTracksToPlaylist(userId, playlistId, [...tracksToAddUris]);
                    for (let track of tracksToAdd) {
                        const query = {title: track.title, artists: track.artists, category: track.category};
                        await Track.findOneAndUpdate(query, {lastAddedAt: new Date()});
                    }
                    text += `${tracksToAddUris.length} tracks were added.\n`;
                }
            }
            else {
                text += `No tracks were recently matched. Exiting...\n`;
            }
            text += `\n\n`;
        }
        res.send(text);
    }
    catch (error) {
        res.send(error);
    }
};

const curator = async (req, res) => {
    try {
        const user = await spotify.getMe();
        const userId = user.body.id;
        const tracks = await getMyRecentlySavedTracks();
        const trackUris = tracks.map(track => track.uri);
        for (let uri of trackUris) {
            const style = await Track.find({spotify_uri: uri}, {}).exec();
            console.log(style);
        }
        res.send(trackUris);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
};

const getMyRecentlySavedTracks = async () => {
    const limit = 50;
    let tracks = [];
    const response = await spotify.getMySavedTracks();
    const total = response.body.total;
    for (let i = 1; i <= Math.ceil(total / limit); i++) {
        const page = await spotify.getMySavedTracks({
            limit: 50, // max you can ask for
            offset: i
        });
        tracks.push(...page.body.items);
    }
    // return tracks.map(track => track.track);
    return tracks.filter(track => {
        return new Date(track.added_at) > new Date(new Date(track.added_at).getTime() - 7 * 24 * 60 * 60 * 1000);
    }).map(track => track.track);
};


module.exports = {
    loginWithSpotify,
    setAccessToken,
    getSpotifyMe,
    matcher,
    getUserPlaylists,
    updater,
    curator
};

// Playlist rules:
// * Max no of track is 99
// * No duplicates
// * No VA
// * When newer tracks are added older tracks are removed
