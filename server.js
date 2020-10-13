const express = require('express');
const app = express();
const router = require('./router').router;
const passport = require('passport');
const session = require('express-session');
const config = require('./config').config;
const path = require('path');

/**
 * Setting express app
 */
app.use(session({
    secret: 'adwadjtrj22',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(new Date().getDate()+1).toUTCString(),
        maxAge: 1000000
    }}));
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(router);

app.listen(config.port, () => {
    console.log('Server started');
})