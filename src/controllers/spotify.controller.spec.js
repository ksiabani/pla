const request = require('supertest');
const app = require('../../src/app');
const mongodbUri = 'mongodb://localhost:27017/test';
const db = require('../services/db.service')(mongodbUri);
const spotifyCtrl = require('../controllers/spotify.controller');

describe('Test the root path', () => {
    test('It should response the GET method', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });
});

describe('Test the root path with supertest', () => {
    test('It should response the GET method', () => {
        return request(app).get('/').expect(200);
    });
});

// http://www.albertgao.xyz/2017/05/24/how-to-test-expressjs-with-jest-and-supertest/
describe('Test the addLike method', () => {
    beforeEach(() => {
        db.connect();
    });

    test('It should response the GET method', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
    });

    afterEach((done) => {
        db.disconnect(done);
    });
});


// const server = require('../server');
// const request = require('supertest')(server);
//
// describe('GET /spotify/me', function() {
//
//     it('should require authorization', done => {
//         request
//             .get('/spotify/me')
//             .expect(401)
//             .end(function(err, res) {
//                 if (err) return done(err);
//                 done();
//             });
//     });

    // var auth = {};
    // before(loginUser(auth));
    //
    // it('should respond with JSON array', function(done) {
    //     request
    //         .get('/api/incidents')
    //         .set('Authorization', 'bearer ' + auth.token)
    //         .expect(200)
    //         .expect('Content-Type', /json/)
    //         .end(function(err, res) {
    //             if (err) return done(err);
    //             res.body.should.be.instanceof(Array);
    //             done();
    //         });
    // });

// });

// function loginUser(auth) {
//     return function(done) {
//         request
//             .post('/auth/local')
//             .send({
//                 email: 'test@test.com',
//                 password: 'test'
//             })
//             .expect(200)
//             .end(onResponse);
//
//         function onResponse(err, res) {
//             auth.token = res.body.token;
//             return done();
//         }
//     };
// }


// const spotifyCtrl = require('../controllers/spotify.controller');
//
// test('should search tracks on spotify', (done) => {
//     const req = {}
//     const res = {}
//     const TrackModel = {
//         find: () => ({
//             limit: () => ({
//                 exec: () => null
//             })
//         })
//     };
//
//     const TrackModel = jest.fn();
//
//     TrackModel
//         .mockReturnValueOnce({
//             find: () => ({
//                 limit: () => ({
//                     exec: () => null
//                 })
//             })
//         })
//     const spotifyService = {}
//
//     spotifyController.matcher(req, res, TrackModel, spotifyService);
//
//     expect(TrackModel.find)
//
// });
