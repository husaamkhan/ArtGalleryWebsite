const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId
const User = require("./UserModel");
const express = require('express');
//Create the router
let router = express.Router();

router.post('/register', registerUser);
router.post('/logIn', logInUser);

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
        req.session.userId = user._id;
        req.session.loggedIn = true;

        console.log('Sending dashboard page for ' + username);
        res.status(200).send('Log in successful');
    }
    else {
        console.log("Couldn't find user with username: " + username);
        res.status(404).send('Invalid credentials');
    }
}

async function renderDashboard(req, res, next) {
    console.log("Finding user with id: " + req.session.userId);
    const user = await User.findOne( { _id: req.session.userId });
    
    if (user) {
        console.log("Found user " + user.name + ". Rendering dashboard");
        res.status(200).render('dashboard', { id: user._id, name: user.name });
    }
    else {
        console.log("User not found");
        res.status(404).send("User not found");
    }
}

module.exports = router;