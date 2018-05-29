const getPlaylists = async (req, res, Playlist) => {
    try {
        const response = await Playlist.getPlaylists();
        res.json(response);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
};

const getPlaylist = async (req, res, Playlist) => {
    try {
        const playlistId = req.params.playlistId;
        const response = await Playlist.getPlaylist(playlistId);
        res.json(response);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
};

const getFeaturedPlaylists = async (req, res, Playlist) => {
    try {
        const styles = req.query.styles.split(',');
        const options = {styles};
        const response = await Playlist.getFeaturedPlaylists(options);
        res.json(response);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
};

const getCuratedPlaylists = async (req, res, Playlist) => {
    try {
        const styles = req.query.styles.split(',');
        const options = {styles};
        const response = await Playlist.getCuratedPlaylists(options);
        res.json(response);
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
};

module.exports = {
    getPlaylists,
    getPlaylist,
    getFeaturedPlaylists,
    getCuratedPlaylists
};