const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const BearerStrategy = require('passport-http-bearer');

const hostname = '127.0.0.1';
const port = 8080;

mongoose.connect('mongodb://localhost:27017');
const UserSchema = mongoose.Schema({name: String, ip: String, jwt: String});
const User = mongoose.model('Users', UserSchema);

const localStrategy = new LocalStrategy(
    {usernameField: "username", passwordField: "pwd"},
    (username, password, done) => {
        User.find({name: username})
            .exec()
            .then(foundUsers => {
                if (!foundUsers || !foundUsers.length) {
                    done("Not found");
                } else {
                    done(null, foundUsers[0]);
                }
            });
    }
);

const bearerStrategy = new BearerStrategy((token, done) => {
    done(null, "pavel");
});

passport.serializeUser((user, done) => {
    const jwt = "sfdlkjljsdffgf";
    User.updateOne(
        {name: user.name},
        {jwt},
        (err, updatedUser) => {
            done(null, jwt);
        }
    );
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

const printReqProperties = (req, res, next) => {
    console.log(`Request to: ${req.url}`);
    console.log(`Method: ${req.method}`);
    next();
}

const getHandler = (req, res) => {
    res.status(200).set('Content-Type', 'text/plain');
    res.send('Hi there!\n');
}

let checkAuthorisation = (req, res, next) => {
    const key = 'IKnowYourSecret';
    const value = 'TheOwlsAreNotWhatTheySeem';
    let isAuthorized = req.headers[key.toLowerCase()] === value;

    if (isAuthorized === true) {
        next();
    } else {
        res.status(401).set('Content-Type', 'text/plain');
        res.send('Please authorise with correct custom header. \n');
    }
}

const postAuthorizedHandler = (req, res) => {
    if (req.body.name) {
        let name = req.body.name;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        User.find({name: name, ip: ip})
            .exec()
            .then(foundUser => {
                if (!foundUser || !foundUser.length) {
                    const user = new User({name: name, ip: ip});
                    user.save((error, savedUser) => {
                        res.send(`Hello, ${savedUser.name}. I figured out your IP: ${savedUser.ip}!`);
                    });
                } else {
                    res.send(`Hello, ${foundUser[0].name}!`);
                }
            });
    } else {
        res.send('Well, hello, stranger.')
    }
}

const errorHandling = (err, req, res, next) => {
    console.log(err.stack);
    res.status(418).send('Something broke and now I\'m a teapot');
}

app.use(printReqProperties);

app.get('/', getHandler);

app.post('/', checkAuthorisation);
app.use(bodyParser.json());
passport.use("local", localStrategy);
passport.use("bearer", bearerStrategy);
app.use(passport.initialize());

app.post("/token", passport.authenticate("local", {
    successRedirect: "/success",
    failureRedirect: "/failure"
}));

app.use(passport.authenticate("bearer", {session: false}), postAuthorizedHandler);

app.use(errorHandling);

app.listen(port, hostname, () => {
    console.log(`Server running on http://${hostname}:${port}!`);
    User.find({}, (err, users) => {
        console.log(
            'In the collection at the moment: ',
            users.map(u => u.name + " " + u.jwt).join(", ")
        );
    })
});