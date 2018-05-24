const spotifyController = require('../controllers/spotify.controller')

test('should search tracks on spotify', (done) => {
    const req = {}
    const res = {}
    const TrackModel = {
        find: () => ({
            limit: () => ({
                exec: () => null
            })
        })
    }

    const TrackModel = jest.fn();

    TrackModel
        .mockReturnValueOnce({
            find: () => ({
                limit: () => ({
                    exec: () => null
                })
            })
        })
    const spotifyService = {}

    spotifyController.matcher(req, res, TrackModel, spotifyService);

    expect(TrackModel.find)

});
