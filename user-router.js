const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId
const User = require('./UserModel');
const express = require('express');
//Create the router
let router = express.Router();

router.post('/register', registerUser);
router.post('/logIn', logInUser);
router.post('/post-artpiece', postArtpiece)

router.get('/logOut', logOutUser);
router.get('/dashboard', renderDashboard);
router.get('/account', renderAccount);
router.get('/following', renderFollowing);
router.get('/workshops-joined', renderWorkshopsJoined);
router.get('/workshops-hosted', renderWorkshopsHosted);
router.get('/artwork', sendArtwork);

router.put('/switchAccount', switchAccount);
router.put('/update', updateAccount);

async function registerUser(req, res, next) {
    console.log('Registering user');
    console.log(req.body);
    
    try {
        let u = new User(req.body);
        await u.save();
        res.status(200).send('Registration successful');
    }
    catch(err) {
        console.log('Registration Error: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function logInUser(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    console.log('Searching for user with username: ' + username);

    try {
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
    catch (err) {
        console.log('Error logging in user: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function postArtpiece(req, res, next) {
    try {
        console.log('Searching for user with username: ' + req.session.username);
        const user = await User.findOne({ username: req.session.username });

        if (user) {
            console.log("Found user. Adding artwork");
            let artwork = req.body;
            artwork.artist = `${user.firstname} ${user.lastname}`;

            user.artwork.push(artwork.title);

            if (!user.artist) {
                user.artist = !user.artist;
            }
            
            await user.save();
            res.status(200).send(JSON.stringify(artwork));
        }
        else {
            console.log("User not found");
            res.status(404).send("User not found!");
        }
    }
    catch(err) {
        console.log("Error posting artpiece to user: " + err);
        res.status(500).send("Intenal server error");
    }
}

function logOutUser(req, res, next) {
    if (req.session.loggedIn) {
        console.log('Logging out ' + req.session.username);
        req.session.loggedIn = false;
        req.session.username = undefined;
        res.status(200).redirect('/');
        return;
    }
};

async function renderDashboard(req, res, next) {
    console.log('Finding user with username: ' + req.session.username);
    
    try {
        const user = await User.findOne( { username: req.session.username });

        if (user) {
            console.log('Found user ' + user.username + '. Rendering dashboard');

            res.status(200).render('dashboard', { firstname: user.firstname, artist: user.artist, artworkLength: user.artwork.length });
            return;
        }
        else {
            console.log('User not found');
            res.status(404).redirect('/');
            return;
        }
    }
    catch (err) {
        console.log('Error rendering dashboard: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function renderAccount(req, res, next) {
    console.log('Finding user with username: ' + req.session.username);

    try {
        const user = await User.findOne( { username: req.session.username });

        if (user) {
            console.log('Found user ' + user.username + '. Rendering account');

            res.status(200).render('account', { user });
            return;
        }
        else {
            console.log('User not found');
            res.status(404).redirect('/');
            return;
        }
    }
    catch (err) {
        console.log('Error rendering account: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function sendArtwork(req, res, next) {
    console.log('Finding user with username: ' + req.session.username);

    try {
        const user = await User.findOne( { username: req.session.username });

        if (user) {
            console.log('Found user ' + user.username + '. Sending artwork.');

            res.status(200).send(JSON.stringify(user.artwork));
            return;
        }
        else {
            console.log('User not found');
            res.status(404).redirect('/');
            return;
        }
    }
    catch (err) {
        console.log('Error rendering workshops-hosted: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function switchAccount(req, res, next) {
    console.log('Finding user with username: ' + req.session.username);

    try {
        const user = await User.findOne( { username: req.session.username } );

        if (user) {
            console.log('Found user ' + user.username );
            console.log(user.artist);
            console.log(user.artwork.length);
            if (!user.artist && user.artwork.length == 0) {
                console.log("User must add art in order to switch account");
                res.status(401).send('Must have artwork posted to switch to artist account');
                return;
            }
            else {
                console.log("Switching account");
                user.artist = !user.artist;
                await user.save();
                res.status(200).send('Account switch successful');
                return;
            }
        }
        else {
            console.log('User not found');
            res.status(404).send('User not found');
            return;
        }
    }
    catch (err) {
        console.log('Error switching account: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function updateAccount(req, res, next) {
    console.log('Updating user with username: ' + req.session.username);

    try {
        const user = await User.findOneAndUpdate( { username: req.session.username }, req.body, { new: true });

        console.log(user);

        if (user) {
            console.log('Updated user ' + user.username);
            req.session.username = user.username;
            console.log('New session username: ' + req.session.username);
            console.log('HERE');
            res.status(200).send('Account updated successfully');
            return;
        }
        else {
            console.log('User not found');
            res.status(404).send('User not found');
            return;
        }
    }
    catch (err) {
        console.log('Error updating account: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function renderFollowing(req, res, next) {
    console.log('Finding user with username: ' + req.session.username);

    try {
        const user = await User.findOne( { username: req.session.username });

        if (user) {
            console.log('Found user ' + user.username + '. Rendering following');

            res.status(200).render('following', { following: user.following });
            return;
        }
        else {
            console.log('User not found');
            res.status(404).redirect('/');
            return;
        }
    }
    catch (err) {
        console.log('Error rendering following: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function renderWorkshopsJoined(req, res, next) {
    console.log('Finding user with username: ' + req.session.username);

    try {
        const user = await User.findOne( { username: req.session.username });

        if (user) {
            console.log('Found user ' + user.username + '. Rendering workshops joined');

            res.status(200).render('workshops-joined', { workshopsJoined: user.workshopsJoined });
            return;
        }
        else {
            console.log('User not found');
            res.status(404).redirect('/');
            return;
        }
    }
    catch (err) {
        console.log('Error rendering workshops-joined: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function renderWorkshopsHosted(req, res, next) {
    console.log('Finding user with username: ' + req.session.username);

    try {
        const user = await User.findOne( { username: req.session.username });

        if (user) {
            console.log('Found user ' + user.username + '. Rendering workshops hosted');

            res.status(200).render('workshops-hosted', { workshopsHosted: user.workshopsHosted });
            return;
        }
        else {
            console.log('User not found');
            res.status(404).redirect('/');
            return;
        }
    }
    catch (err) {
        console.log('Error rendering workshops-hosted: ' + err);
        res.status(500).send('Internal server error');
    }
}

module.exports = router;