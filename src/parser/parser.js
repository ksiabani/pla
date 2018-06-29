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
                // A possible cause: The case of Feel Good by Maribou State:
                // https://line-in.spotify.com/track/5EhyJGUafXNnPniaIQnSER
                // So Maribou State had a single out that have to verions of the same track. The two versions are:
                // 1 Feel Good (feat. Khruangbin) - Edit 3:38
                // 2 Feel Good (feat. Khruangbin) 4:27
                // The two tracks on Beatport are like this:
                // https://www.beatport.com/release/feel-good-feat-khruangbin/2313834
                // 1. Feel Good (feat. Khruangbin) feat. Khruangbin
                // 2. Feel Good (feat. Khruangbin) feat. Khruangbin
                // So they have the same name and maybe that's the reason. I have to make sure that I check if
                // the track already exists
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
