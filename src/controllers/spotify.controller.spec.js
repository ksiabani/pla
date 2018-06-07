const request = require('supertest');
const app = require('../../src/app');
const spotifyCtrl = require('../controllers/spotify.controller');

// This controller will:
// 1. Is retro
// 2. Fetch some tracks from db
// 3. Search for each on spotify
// 4. Return uri and release date
// 5. Update each track in database (fields releaseDate, spotifyUri and lastScannedAt)
// 6. Send response
// 7. Flow stop
//
// Alternate flows
//
// 1a. Is not retro
// 2a. Go to step 2
//
// 2b. No tracks found in db
// 3b. Send response
//
// 4c. Track not found on spotify
// 5c. Update each track in db (fields releaseDate and spotifyUri are now null)
// 6c. Go to step 6
//
// 4d. Track found but it was released later than a month
// 5d. 5c. Update each track in db (fields releaseDate and spotifyUri are now null)
// 6d. Go to step 6

// 4d. Track found but belongs to an album whose artist is "Various Artists"
// 5d. 5c. Update each track in db (fields releaseDate and spotifyUri are now null)
// 6d. Go to step 6

describe('Spotify controller', () => {

    const req = {};
    const res = {send: () => null};
    const Track = {};
    const spotify = {};
    let retro;

    const mock = {
        spotify: {
            trackFound: {
                body: {
                    tracks: {
                        items: [
                            {
                                album: {
                                    artists: [
                                        {
                                            name: 'Foo',
                                        }
                                    ],
                                    release_date: '2018-06-01'
                                },
                                uri: 'spotify:track:123'
                            }
                        ]
                    }
                }
            },
            trackNotFound: {
                body: {
                    tracks: {
                        items: []
                    }
                }
            }
        },
        db: {
            tracks: [
                {
                    "_id": "1",
                    "artists": [
                        "Foo"
                    ],
                    "title": "Bar",
                    "styles": [
                        "Electronica"
                    ]
                }
            ]
        }
    };


    describe('Matcher', () => {

        // Mock Track model's methods
        Track.getNotScanned = jest.fn().mockResolvedValue(mock.db.tracks);
        Track.getRandomScannedNotMatched = jest.fn().mockResolvedValue(mock.db.tracks);
        Track.update = jest.fn().mockResolvedValue({nModified: null});

        // Mock Spotify methods
        spotify.searchTracks = jest.fn().mockResolvedValue(mock.spotify.trackFound);

        test('should find a track on Spotify and update the database', async () => {

            // Precondition
            retro = false;

            // Call the controller
            await spotifyCtrl.matcher(req, res, spotify, Track, retro);

            // Assertions
            expect(Track.getNotScanned).toHaveBeenCalled();
            expect(Track.getRandomScannedNotMatched).not.toHaveBeenCalled();
            expect(spotify.searchTracks).toHaveBeenCalled();
            expect(Track.update).toHaveBeenCalled();
        });

    });

});
