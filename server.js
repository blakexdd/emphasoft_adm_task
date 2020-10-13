const express = require('express');
const app = express();
const router = require('./router').router;
const passport = require('passport');
const request = require('request');
const VKontakteStrategy = require('passport-vkontakte').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const port = process.env.PORT || '8080';
const host = process.env.HOST || 'localhost';
const cookieParser = require('cookie-parser');
const {v4: uuidv4} = require('uuid');
app.use(cookieParser());

app.use(session({
    secret: 'adwadjtrj22',
    store: new MongoStore({
        url: 'mongodb://localhost/emphasoft',
    }),
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.set('views', __dirname + '/public');

//app.use(router);

passport.use(new VKontakteStrategy(
    {
        clientID:     "7626527",
        clientSecret: "OAjUQOdBARIACLpw3iYz",
        callbackURL:  "http://localhost:8080/auth/vkontakte/callback",
        scope: ['status', 'email', 'friends']
    },
    function myVerifyCallbackFn(req, accessToken, refreshToken, params, profile, done) {
        console.log("Access token ", accessToken);
        //req.session.accessToken = accessToken;
        done(null, {accessToken: accessToken});
    }
));

passport.serializeUser(function (user, done) {
    console.log('Here');
    done(null, user.accessToken);
});


passport.deserializeUser(function (user, done) {
    console.log('User: ', user);
    done(null, user);
});

app.get('/auth/vkontakte',
    passport.authenticate('vkontakte', { scope: ['status', 'email', 'friends'] }));

app.get('/auth/vkontakte/callback',
    passport.authenticate('vkontakte', {
        successRedirect: '/',
        failureRedirect: '/login'
    })
);

app.get('/', (req, res, next) => {
    console.log('Token: ', req.user);
    console.log('session: ', req.session);
    console.log('Cookie: ', req.cookies);

    res.cookie('AAa', 1);

    if (req.user){
        request({
                method: "GET",
                uri: "https://api.vk.com/method/friends.get",
                qs: {
                    order: "random",
                    count: "5",
                    access_token: req.user,
                    v: "5.64",
                    fields: ["nickname", "sex", "photo_200_orig"]
                }},
            (err, res1, body) => {
                if (err)
                    console.log(err);

                const users = JSON.parse(body).response.items;

                res.render("index.ejs", {users: users,
                    authenticated: true});
            });
    }
    else
        res.render("index.ejs");

});

app.listen(port, host, () => {
    console.log('Server started');
})