const User = require('./UserModel');
const express = require('express');
//Create the router
let router = express.Router();

router.post('/register', registerUser);
router.post('/logIn', logInUser);
router.post('/post-artpiece', postArtpiece)
router.post('/like/:title', like);
router.post('/unlike/:title', unlike);
router.post('/post-review/:title', postReview);
router.post('/follow/:username', followUser);

router.get('/logOut', logOutUser);
router.get('/dashboard', renderDashboard);
router.get('/account', renderAccount);
router.get('/following', renderFollowing);
router.get('/workshops-joined', renderWorkshopsJoined);
router.get('/workshops-hosted', renderWorkshopsHosted);
router.get('/artwork', sendArtwork);
router.get('/get-user-info', sendUserInfo);
router.get('/add-review', renderAddReviewPage);
router.get('/get-artist', getArtist);
router.get('/profile/:username', renderProfile);
router.get('/get-following', sendFollowing);
router.get('/search-artist', renderSearch);
router.get('/search/:name/:page', findArtist);
router.get('/followers', renderFollowers)

router.put('/switchAccount', switchAccount);
router.put('/update', updateAccount);

router.delete('/delete-review/:title', deleteReview);
router.delete('/unfollow/:username', unfollowUser);

async function registerUser(req, res, next) {
    console.log('Registering user');
    
    try {
        let user = new User(req.body); // Create the new user from the data in the request body
        await user.save(); // Save the user to the User collection
        res.status(200).send('Registration successful');
    }
    catch(err) {
        if (err.code == 11000) { // This means the key (the username in this case) is already being used in another document
            console.log("Username taken");
            res.status(400).send('Registration error: That username has been taken');
            return;
        }
        console.log('Registration Error: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function logInUser(req, res, next) {
    // Get the log in information from the request body
    const username = req.body.username;
    const password = req.body.password;
    console.log('Searching for user with username: ' + username);

    try {
        const user = await User.findOne({ username: username, password: password });

        if (user) {
            console.log('Found user with username: ' + username);
            req.session.username = user.username; // Set the session's username
            req.session.loggedIn = true; // Set the session to 'logged in'

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

            // Create the artwork from the data in the request body, assign it an object id, and set it's artist attribute
            let artwork = req.body;
            artwork.artist = `${user.firstname} ${user.lastname}`;

            user.artwork.push(artwork.title);

            if (!user.artist) { // If the user is not an artist, turn them into an artist
                user.artist = !user.artist;
            }
            
            await user.save();
            // Send the modified artwork back to the client so that it can be sent to the gallery collection as well
            res.status(200).send(JSON.stringify(artwork));
            
            notifyFollowers(user, `${user.username} posted a new artpiece`)
        }
        else {
            console.log("User not found");
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).send("User not found!");
        }
    }
    catch(err) {
        console.log("Error posting artpiece to user: " + err);
        res.status(500).send("Intenal server error");
    }
}

async function notifyFollowers(artist, message) {
    try {
        console.log("Notifying followers");
        for (let follower of artist.followers) {
            const user = await User.findOne({ username: follower });

            if (user) {
                console.log('Notifying user: ' + user.username);
                user.notifications.push(message);
                await user.save();
            }
            else {
                console.log('User:  + ' + user.username + ' not found');
            }
        }
    }
    catch (err) {
        console.log("Error notifying followers: " + err);
    }
}

async function like(req, res, next) {
    try {
        console.log('Searching for user with username: ' + req.session.username);
        const user = await User.findOne({ username: req.session.username });

        if (user) {
            console.log("User with username" + req.session.username + " found");

            user.likes.push(req.params.title);
            await user.save();

            res.status(200).send("Added like to user likes successfully");
        }
        else {
            console.log("User not found");
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).send("User not found");
        }
    }
    catch (err) { 
        console.log("Error adding like to user likes: " + err);
        res.status(500).send("Internal server error");
    }
}

async function unlike(req, res, next) {
    try {
        console.log('Searching for user with username: ' + req.session.username);
        const user = await User.findOne({ username: req.session.username });

        if (user) {
            console.log("User with username" + req.session.username + " found");

            user.likes = user.likes.filter(title => title != req.params.title);
            await user.save();

            res.status(200).send("Removed like from user likes successfully");
        }
        else {
            console.log("User not found");
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).send("User not found");
        }
    }
    catch (err) { 
        console.log("Error removing like from user likes: " + err);
        res.status(500).send("Internal server error");
    }
}

async function postReview(req, res, next) {
    try {
        console.log("Searching for user with username: " + req.session.username);
        const user = await User.findOne({ username: req.session.username });

        if (user) {
            console.log(req.params.title);
            console.log("User with username" + req.session.username + " found. Adding title " + req.params.title + " to reviews");
            user.reviews.push(req.params.title);
            await user.save();

            res.status(200).send("Added title to user's reviews successfully");
        }
        else {
            console.log("User not found");
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).send("User not found");
        }
    }
    catch (err) {
        console.log("Error posting review to user: " + err);
        res.status(500).send("Internal server error");
    }
}

async function followUser(req, res, next) {
    try {
        console.log("Searching for user with username: " + req.session.username);
        const client = await User.findOne({ username: req.session.username });

        if (client) {
            console.log("User with username: " + client.username + " found");

            console.log("Searching for user with username: " + req.params.username);
            const artist = await User.findOne({ username: req.params.username });

            if (artist) {
                console.log("User with username: " + artist.username + ". Following user");

                client.following.push(artist.username);
                artist.followers.push(client.username);

                client.save();
                artist.save();

                res.status(200).send("Added title to user's reviews successfully");
            }

        }
        else {
            console.log("User not found");
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).send("User not found");
        }
    }
    catch (err) {
        console.log("Error following user to user: " + err);
        res.status(500).send("Internal server error");
    }
}

function logOutUser(req, res, next) {
    if (req.session.loggedIn) { // If the user is already logged in, log them out and redirect the user to the log in page
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
            // Only render the dashboard with the necessary information (firstname, whether or not user is an artist, how much art they have posted)
            // to avoid potentially exposing sensitive information (e.g password)
            res.status(200).render('dashboard', { 
                firstname: user.firstname, 
                artist: user.artist, 
                artwork: user.artwork, 
                notifications: user.notifications,
                likes: user.likes,
                reviews: user.reviews 
            });
            return;
        }
        else {
            console.log('User not found');
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).redirect('/'); // If no user is found, redirect to log in page
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

            res.status(200).render('account', { user }); // Render the account information page for this user
            return;
        }
        else {
            console.log('User not found');
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).redirect('/'); // If no user found, redirect to log in page
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
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).redirect('/'); // If user is not found, redirect them to the log in page
            return;
        }
    }
    catch (err) {
        console.log('Error rendering workshops-hosted: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function sendUserInfo(req, res, next) {
    try {
        console.log("Searching for user with username: " + req.session.username);
        const user = await User.findOne({ username: req.session.username });

        if (user) {
            console.log("Found user with username: " + user.username);
            const userInfo = {
                firstname: user.firstname,
                lastname: user.lastname,
                artwork: user.artwork,
                likes: user.likes,
                reviews: user.reviews
            }
            
            res.status(200).send(JSON.stringify(userInfo));
        }
        else {
            console.log("User not found!");
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).send("User not found!");
        }

    }
    catch (err) {
        console.log("Error sending user info: " + err);
    }
}

async function renderAddReviewPage(req, res, next) {
    console.log('Finding user with username: ' + req.session.username);
    
    try {
        const user = await User.findOne( { username: req.session.username });

        if (user) {
            console.log('Found user ' + user.username + '. Rendering add-review');
            res.status(200).render('add-review');
            return;
        }
        else {
            console.log('User not found');
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).redirect('/'); // If no user is found, redirect to log in page
            return;
        }
    }
    catch (err) {
        console.log('Error rendering add-review: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function getArtist(req, res, next) {    
    try {
        const name = req.query.artist.split(' ');
        const firstname = name[0];
        let lastname = name[1];

        if (lastname === undefined) { // If the user has no last name (e.g Banksy, Luke), then make their last name ''
            lastname = '';
        }
        const artpiece = req.query.artpiece;

        console.log('Finding artist with firstname: ' + firstname + ' and lastname: ' + lastname);


        const user = await User.findOne( { firstname: firstname, lastname: lastname, artwork: artpiece });

        if (user) {
            console.log('Found user ' + user.username + '. Redirecting');
            res.status(200).redirect(`/user/profile/${user.username}`);
            return;
        }
        else {
            console.log('User not found');
            res.status(404).send("Artist not found");
            return;
        }
    }
    catch (err) {
        console.log('Error finding user: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function renderProfile(req, res, next) {
    try {
        console.log("Searching for user with username: " + req.params.username);

        const user = await User.findOne({ username: req.params.username });

        if (user) {
            console.log("Found user with username: " + user.username + ". Rendering profile");

            res.status(200).render('profile', {
                thisuser: req.session.username, // Used to check if the profile being viewed is this user, to prevent the user from following themself
                username: user.username,
                name: `${user.firstname} ${user.lastname}`,
                following: user.following,
                followers: user.followers,
                artwork: user.artwork,
                workshops: user.workshopsHosted
            })
        }
        else {
            console.log("User with username: " + req.params.username + ' not found');
            res.status(404).send("User not found");
        }

    }
    catch (err) {
        console.log("Error rendering profile: " + err);
        res.status(500).send('Internal server error');
    }
}

async function sendFollowing(req, res, next) {
    try {
        console.log("Searching for user with username: " + req.session.username);
        const user = await User.findOne({ username: req.session.username });

        if (user) {
            console.log("Found user with username: " + req.session.username +". Sending following list");

            res.status(200).send(JSON.stringify(user.following));
        }
        else {
            console.log("User with username: " + req.session.username + ' not found');
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).send("User not found");
        }

    }
    catch (err) {
        console.log("Error sending following list: " + err);
        res.status(500).send('Internal server error');
    }
}

async function renderSearch(req, res, next) {
    try {
        console.log('Rendering search');
        res.status(200).render('search-artist');
    }
    catch (err) {
        console.log("Error rendering search: " + err);
        res.status(500).send("Internal server error");
    }
}

async function findArtist(req, res, next) {
    try {
        console.log("Searching for artists that match: " + req.params.name + " " + req.params.page);
        
        let filter = {};

        if (req.params.name !== 'All') {
            let name = fixLetterCasing(req.params.name);
            name = name.split(' ');
            let firstname = name.shift();
            let lastname = name.join(' ');

            if (!lastname) {
                lastname = '';
            }

            filter.firstname = firstname;
            filter.lastname = lastname;
        }

        filter.artist = true;
        console.log(filter);

        // Find the users from the user collection. Apply the filter and limit to the search query
        const result = await User.find(filter).skip(req.params.page * 10).limit(10);

        if (result.length > 0) { 
            console.log("Result found. sending result");
            res.status(200).send(JSON.stringify(result));
        }
        else {
            console.log('Result not found');
            res.status(404).send(JSON.stringify(result));
        }
    }
    catch (err) {
        console.log("Error finding artists: " + err);
        res.status(500).send('Internal server error');
    }
}

function fixLetterCasing(sentence) {
    // Capitalize first letter of each word in the sentence
    sentence = sentence.toLowerCase();
    sentence = sentence.split(' ');
    sentence = sentence.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    sentence = sentence.join(' ');
    return sentence;
}

async function renderFollowers(req, res, next) {
    try {
        console.log('Searching for user with username: ' + req.session.username);
        const user = await User.findOne({ username: req.session.username });

        if (user) {
            console.log('Found user: ' + user.username + '. Rendering followers');

            res.status(200).render('followers', { followers: user.followers });
        }
    }
    catch (err) {
        console.log("Error rendering follower: " + err);
        res.status(500).send('Internal server error');
    }
}

async function switchAccount(req, res, next) {
    console.log('Finding user with username: ' + req.session.username);

    try {
        const user = await User.findOne( { username: req.session.username } );

        if (user) {
            console.log('Found user ' + user.username );

            // If the user has not posted any art yet, send 401, which tells the client to redirect the user to the 'add artwork' page
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
            req.session.loggedIn = false;
            req.session.username = undefined;
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

        if (user) {
            console.log('Updated user ' + user.username);
            req.session.username = user.username;
            console.log('New session username: ' + req.session.username);
            res.status(200).send('Account updated successfully');
            return;
        }
        else {
            console.log('User not found');
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).send('User not found'); // Send 404 if user not found, client will redirect user to log in page
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
            req.session.loggedIn = false;
            req.session.username = undefined;
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
            req.session.loggedIn = false;
            req.session.username = undefined;
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
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).redirect('/');
            return;
        }
    }
    catch (err) {
        console.log('Error rendering workshops-hosted: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function deleteReview(req, res, next) {
    console.log('Finding user with username: ' + req.session.username);

    try {
        const user = await User.findOne( { username: req.session.username });

        if (user) {
            console.log('Found user ' + user.username + '. Deleting review');
            user.reviews = user.reviews.filter(review => review != req.params.title);
            await user.save();

            res.status(200).send('Successfully deleted review from user');
            return;
        }
        else {

            console.log('User not found');
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).redirect('/');
            return;
        }
    }
    catch (err) {
        console.log('Error deleting review from user: ' + err);
        res.status(500).send('Internal server error');
    }
}

async function unfollowUser(req, res, next) {
    console.log('unfollowing user');
    try {
        console.log("Searching for user with username: " + req.session.username);
        const client = await User.findOne({ username: req.session.username });

        if (client) {
            console.log("User with username: " + client.username + " found");

            console.log("Searching for user with username: " + req.params.username);
            const artist = await User.findOne({ username: req.params.username });

            if (artist) {
                console.log("Found User with username: " + artist.username)

                client.following = client.following.filter(profile => profile != artist.username);
                artist.followers = artist.followers.filter(profile => profile != client.username);

                console.log(client.following);

                client.save();
                artist.save();

                res.status(200).send("Added title to user's reviews successfully");
            }

        }
        else {
            console.log("User not found");
            req.session.loggedIn = false;
            req.session.username = undefined;
            res.status(404).send("User not found");
        }
    }
    catch (err) {
        console.log("Error unfollowing user to user: " + err);
        res.status(500).send("Internal server error");
    }
}

module.exports = router;