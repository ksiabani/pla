const Track = require('../models/track.model');
const Beatport = require('./providers/beatport.provider');
const Traxsource = require('./providers/traxsource.provider');
const mongodbUri = process.env.MONGODB_URI;
const db = require('../services/db.service')(mongodbUri);

const beatport = new Beatport();
const traxsource = new Traxsource();

const providers = [
    beatport,
    traxsource
];

const go = async () => {
    try {
        await db.connect();
        console.log(`Connected to Mongo.`);
        for (let provider of providers) {
            const meta = await provider.parser();
            const options = {upsert: true, new: true, setDefaultsOnInsert: true};
            for (let piece of meta) {
                const query = {title: piece.title, artists: piece.artists, category: piece.category};
                // TODO: Revise findOneAndUpdate? Works fine but this will update every record
                // Is there other way to insert if not found?
                // TODO: Return count of new records added
                // TODO: You must provide for the case where the same track is found in different providers
                // with different style. if leave it as it is the last track will override styles (maybe its OK?)
                // TODO: Duplicates are found in playlists, do you check if this track already exists before inserting
                // Example tracks to check this:
                // https://line-in.spotify.com/track/65rdVZ2yUKVAwlMm2TXzm2
                // https://line-in.spotify.com/entity/spotify:track:6ycufHNIKNWQopzF45nrmF
                await Track.findOneAndUpdate(query, {styles: piece.styles}, options);
            }
            console.log(`Done parsing ${meta.length} titles from ${provider.constructor.name}`);
        }
        console.log('The end.');
    }
    catch (error) {
        console.log(error);
    }
};

go();
