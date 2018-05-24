const bootstrap = require('../../server')
const request = require('supertest');
const app = bootstrap(true);

test('auth returns status 301', (done) => {
    request(app)
        .get('/auth/spotify/callback/?code')
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(302, done)
});
