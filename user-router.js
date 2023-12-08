const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId
const User = require("./UserModel");
const express = require('express');
//Create the router
let router = express.Router();

router.post('/register', registerUser);
router.post('/logIn', logInUser);

router.get('/logOut', logOutUser);
router.get('/dashboard', renderDashboard);


async function registerUser(req, res, next) {
    console.log('Registering user');
    console.log(req.body);
    
    try {
        let u = new User(req.body);
        await u.save();
        res.status(200).send("Registration successful");
    }
    catch(err) {
        console.log('Registration Error: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function logInUser(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    console.log("Searching for user with username: " + username);

    const user = await User.findOne({ username: username, password: password }).exec();

    if (user) {
        console.log('Found user with username: ' + username);
        req.session.username = user.username;
        req.session.loggedIn = true;

        console.log('Sending dashboard page for ' + username);
        res.status(200).send('Log in successful');
    }
    else {
        console.log("Couldn't find user with username: " + username);
        res.status(404).send('Invalid credentials');
    }
}

function logOutUser(req, res, next) {
    if (req.session.loggedIn) {
        console.log("Logging out " + req.session.username);
        req.session.loggedIn = false;
        req.session.username = undefined;
        res.status(200).redirect('/');
        return;
    }
};

async function renderDashboard(req, res, next) {
    console.log("Finding user with username: " + req.session.username);
    const user = await User.findOne( { username: req.session.username });

    if (user) {
        console.log("Found user " + user.name + ". Rendering dashboard");
        res.status(200).render('dashboard', { id: user._id, name: user.name });
        return;
    }
    else {
        console.log("User not found");
        res.status(404).redirect('/');
        return;
    }
}

module.exports = router;