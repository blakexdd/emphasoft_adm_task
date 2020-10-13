const express = require('express');
const router = express.Router();
const passport = require('passport');
const request = require('request');
const config = require('./config').config;
const VKontakteStrategy = require('passport-vkontakte').Strategy;

passport.use(new VKontakteStrategy(
    {
        clientID:     "7626527",
        clientSecret: "OAjUQOdBARIACLpw3iYz",
        callbackURL:  "/auth/vkontakte/callback",
        proxy: true,
        scope: ['status', 'email', 'friends', 'photo']
    },
    (req, accessToken, refreshToken, params, profile, done) => {
        done(null, {accessToken: accessToken,
                photo: profile.photos[0].value,
                name: profile.displayName});
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

router.get('/auth/vkontakte',
    passport.authenticate('vkontakte', { scope: ['status', 'email', 'friends'] }));

router.get('/auth/vkontakte/callback',
    passport.authenticate('vkontakte', {
        successRedirect: '/',
        failureRedirect: '/login'
    })
);

router.get('/', (req, res, next) => {
    if (req.user){
        request({
                method: "GET",
                uri: "https://api.vk.com/method/friends.get",
                qs: {
                    order: "random",
                    count: "5",
                    access_token: req.user.accessToken,
                    v: "5.64",
                    fields: ["nickname", "sex", "photo_200_orig"]
                }},
            (err, res1, body) => {
                if (err)
                    console.log(err);

                const users = JSON.parse(body).response.items;

                res.render("index.ejs", {users: users,
                    authenticated: true, user: req.user});
            });
    }
    else
        res.render("index.ejs");

});

module.exports.router = router;