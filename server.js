'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;


// const swig = require('swig');


// const consolidate = require('consolidate');

const appKey = 'a521d27c6707473da14d2cc038ea942c';
const appSecret = 'b2da3f96d90a4e8aa5595e435ef1e617';


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


// Use the SpotifyStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, expires_in
//   and spotify profile), and invoke a callback with a user object.
passport.use(new SpotifyStrategy({
        clientID: appKey,
        clientSecret: appSecret,
        callbackURL: 'http://localhost:3500/auth/spotify/callback/'
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            // To keep the example simple, the user's spotify profile is returned to
            // represent the logged-in user. In a typical application, you would want
            // to associate the spotify account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }));





const app = express();
const port = process.env.PORT || 3500;

const routes = require('./api/routes');

app.use(cookieParser());
// app.use(bodyParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({
    secret: 'cookie_secret',
    name: 'cookie_name',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());


// // GET /auth/spotify
// //   Use passport.authenticate() as route middleware to authenticate the
// //   request. The first step in spotify authentication will involve redirecting
// //   the user to spotify.com. After authorization, spotify will redirect the user
// //   back to this application at /auth/spotify/callback
// app.get('/spotify/auth',
//     passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private'], showDialog: true}),
//     function(req, res){
// // The request will be redirected to spotify for authentication, so this
// // function will not be called.
//     });

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
// app.get('/spotify/callback',
//     passport.authenticate('spotify', { failureRedirect: '/login' }),
//     function(req, res) {
//         res.redirect('/');
//     });

app.get('/', function(req, res){
    // res.render('index.html', { user: req.user });
    res.send({ user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
    // res.render('account.html', { user: req.user });
    res.send({ user: req.user });
});

app.get('/login', function(req, res){
    // res.render('login.html', { user: req.user });
    res.send('Sorry friend, you must be logged in to do that.');
});

app.get('/auth/spotify',
    passport.authenticate('spotify', {
        scope: ['user-read-email', 'user-read-private']
    }),
    function (req, res) {
    });

app.get('/auth/spotify/callback',
    passport.authenticate('spotify', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/:provider/:genre/:category', ensureAuthenticated, function(req, res){
    res.send({ user: req.user });
});

routes(app);


app.listen(port);

console.log("Node application running on port " + port);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}


// https://github.com/thelinmichael/spotify-web-api-node
// https://www.npmjs.com/package/passport-spotify
// https://www.npmjs.com/package/spotify-uri
