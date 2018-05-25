const loginWithSpotify = (req, res, config, spotify) => {
    res.redirect(spotify.createAuthorizeURL(config.spotify.scopes));
};

const setAccessToken = async (req, res, spotify) => {
    try {
        const code = req.query.code;
        const response = await spotify.authorizationCodeGrant(code);
        spotify.setAccessToken(response.body['access_token']);
        spotify.setRefreshToken(response.body['refresh_token']);
        const me = await spotify.getMe();
        res.send(me.body);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
};

const getSpotifyMe = async (reg, res, spotify) => {
    try {
        const response = await spotify.getMe();
        res.json(response.body);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
};

const getUserPlaylists = async (req, res, spotify) => {
    try {
        const user = await spotify.getMe();
        const response = await spotify.getUserPlaylists(user.body.id);
        res.json(response.body);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }

};

// Uses seeds to search for tracks in Spotify
const matcher = async (req, res, spotify, Track, retro) => {
    try {

        // Query
        // const query = retro ?
        //     // Get 100 random tracks that don't have been scanned but not matched
        //     // The idea is that Spotify might have added them since last check
        //     Track.getRandomScannedNotMatched() :
        //     // Get tracks that don't have a Spotify URI, limit to 100 to avoid limit rate
        //     Track.getNotScanned();

        // Get seeds
        // const seeds = await query.exec();

        const seeds = retro ? await Track.getRandomScannedNotMatched() : await Track.getNotScanned();

        let updated = 0;

        // Search in Spotify
        for (let seed of seeds) {
            const query = {title: seed.title, artists: seed.artists};
            const searchPhrase = `track:${seed.title} artist:${seed.artists.join(' ')}`;
            const track = await spotify.searchTracks(searchPhrase, {limit: 1});
            const uri = track && track.body.tracks.items[0] && track.body.tracks.items[0].uri;

            // If found update track with URI
            if (uri) {
                const response = await Track.update(query, {spotify_uri: uri}, {multi: true});
                if (response.nModified > 0) {
                    updated += response.nModified;
                }
            }

            // Update last scanned date on each track that a search was performed on
            await Track.update(query, {lastScannedAt: new Date()}, {multi: true});
        }
        res.send(`${updated} tracks were ${retro ? 'retro-' : ''}matched.`);

    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
};

// Adds newly found tracks to picked playlists based on their genre
const picker = async (req, res, config, spotify, Track) => {
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

// Check for tracks recently added to library, and move them to curated playlists
const curator = async (req, res, config, spotify, Track) => {
    try {
        let text = '';
        let noOfTracks = 0;
        let curated = [];
        const user = await spotify.getMe();
        const userId = user.body.id;
        const tracks = await getMyRecentlySavedTracks(spotify);
        if (tracks.length) {
            const trackUris = tracks.map(track => track.uri);
            for (let uri of trackUris) {
                const track = await Track.findOne({spotify_uri: uri}, {styles: 1, _id: 0}).exec();
                if (track && track.styles.length) {
                    let styles = track.styles;
                    // Special case for Electronica:
                    // We want styles of 'Electronica / Downtempo' or 'Electronica' to end up in the same curated list
                    if (styles.join().includes('Electronica')) {
                        styles = 'Electronica';
                    }
                    for (let details of config.playlists.curated) {
                        if (styles.includes(details.style)) {
                            const playlistId = details.id;
                            const playlist = await spotify.getPlaylist(userId, playlistId);
                            const playlistTrackUris = playlist.body.tracks.items.map(item => item.track.uri);
                            if (!playlistTrackUris.includes(uri)) { // Track not contained in playlist, go ahead and add it
                                await spotify.addTracksToPlaylist(userId, playlistId, [uri]);
                                // Some logging info
                                ++noOfTracks;
                                if (!curated.includes(details.style)) {
                                    curated.push(details.style);
                                }
                            }
                        }
                    }
                }
            }
            text = noOfTracks ?
                `${noOfTracks} of ${tracks.length} tracks were added to ${curated.length} playlists (${curated.join(', ')}).` :
                `${tracks.length} tracks were found in library. No tracks were added to playlists.`;
        }
        else {
            text = `No tracks were added to library within last week. Go add some.`;
        }
        res.send(text);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
};

// Return library tracks added within last week
const getMyRecentlySavedTracks = async spotify => {
    const limit = 50;
    let tracks = [];
    const response = await spotify.getMySavedTracks();
    const total = response.body.total;
    for (let i = 1; i <= Math.ceil(total / limit); i++) {
        const page = await spotify.getMySavedTracks({
            limit: 50, // max you can ask for
            offset: (i - 1) * 50
        });
        tracks.push(...page.body.items);
    }
    return tracks.filter(track => {
        return new Date(track.added_at) > new Date(new Date(track.added_at).getTime() - 7 * 24 * 60 * 60 * 1000);
    }).map(track => track.track);
};

module.exports = {
    loginWithSpotify,
    setAccessToken,
    getSpotifyMe,
    getUserPlaylists,
    matcher,
    picker,
    curator
};
