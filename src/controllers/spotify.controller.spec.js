const request = require('supertest');
const app = require('../../src/app');
const spotifyCtrl = require('../controllers/spotify.controller');

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
