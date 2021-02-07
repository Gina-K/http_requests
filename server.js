const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const BearerStrategy = require('passport-http-bearer');

const hostname = '127.0.0.1';
const port = 8080;

const jwt = "qwjeoieqjwwe.weoriwpeori.sdoifpodsf";

mongoose.connect('mongodb://localhost:27017');
const UserSchema = mongoose.Schema({name: String, password: String, jwt: String});
const User = mongoose.model('Users', UserSchema);

const localStrategy = new LocalStrategy(
    {usernameField: "username", passwordField: "pwd"},
    (username, password, done) => {
        User.findOne({name: username})
            .exec()
            .then(foundUser => {
                if (!foundUser) {
                    done("The user not found");
                } else if(foundUser.password !== password) {
                    done("Incorrect password. Access denied.")
                } else {
                    done(null, foundUser);
                }
            });
    }
);

const bearerStrategy = new BearerStrategy((token, done) => {
    if (token === jwt) {
        done(null, true);
    } else {
        done("Access denied.");
    }
});

passport.serializeUser((user, done) => {
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

const postAuthorizedHandler = (req, res) => {
    if (req.body.username) {
        let name = req.body.username;
        let password = req.body.pwd;

        User.find({name: name})
            .exec()
            .then(foundUsers => {
                if (!foundUsers || !foundUsers.length) {
                    const user = new User({name: name, password: password});
                    user.save((error, savedUser) => {
                        res.send(`Hello, ${savedUser.name}.`);
                    });
                } else {
                    res.send(`Hello, ${foundUsers[0].name}. Welcome back!`);
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

app.use(passport.authenticate("bearer", {session: false}));

app.use(printReqProperties);
app.get('/', getHandler);
app.use(bodyParser.json());

passport.use("local", localStrategy);
passport.use("bearer", bearerStrategy);
app.use(passport.initialize());

app.post("/token", passport.authenticate("local", {
    successRedirect: "/success",
    failureRedirect: "/failure"
}));

app.use(postAuthorizedHandler);
// app.use(passport.authenticate("bearer", {session: false}), postAuthorizedHandler);

// app.use(errorHandling);

app.listen(port, hostname, () => {
    console.log(`Server running on http://${hostname}:${port}!`);
    User.find({}, (err, users) => {
        console.log(
            'In the collection at the moment: ',
            users.map(u => u.name + " " + u.jwt + " " + u.password).join(",\n")
        );
    })
});