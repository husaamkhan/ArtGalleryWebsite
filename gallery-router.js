const Gallery = require('./ArtModel');
const express = require('express');
//Create the router
let router = express.Router();

router.get('/add-artwork', renderAddArtwork);
router.get('/get-artpieces', sendArtpieces);
router.get('/validate-art/:title', validateArtpiece);
router.get('/view-art/:title', renderArtpiecePage);
router.get('/search-art', renderSearch);
router.get('/search/:title/:category/:medium/:artist/:page', findArt);
router.get('/artwork', renderArtwork);

router.post('/post-artpiece', postArtpiece);
router.post('/like/:title', like);
router.post('/unlike/:title', unlike);
router.post('/post-review/:title', postReview);

router.delete('/delete-review/:title', deleteReview);

function renderAddArtwork(req, res, next) {
    console.log('Rendering add artwork');
    if (req.session.loggedIn) {
        res.status(200).render('add-artwork');
        return;
    }
    else { // If the user is not logged in, redirect them to the log in page
        console.log("Error: Not logged in");
        res.status(404).redirect('/');
        return;
    }
}

async function sendArtpieces(req, res, next) {
    try {
        // Get the artwork list from the user, which is a query string of object ids, and split them up into an array
        const titles = req.query.titles.split(','); 
        // Find all documents whose id is in the array
        const result = await Gallery.find({ title: { $in: titles }}, { title: 1, _id: 0 });
        
        res.status(200).send(JSON.stringify(result));
    }
    catch (err) {
        console.log("Error sending artpieces: " + err);
        res.status(500).send("Internal server error");
    }
}

async function validateArtpiece(req, res, next) { // Checks if an artpiece with the chosen name is already in the database
    try {
        console.log('Searching for artpiece with title: ' + req.params.title);
        const result = await Gallery.findOne({ title: req.params.title });

        if (result) {
            console.log('Artpiece with title ' + req.params.title + ' already exists');
            res.status(400).send('Artpiece with title ' + req.params.title + ' already exists');
        }
        else {
            console.log('Title ' + req.params.title + ' is not taken');
            res.status(200).send('Title ' + req.params.title + ' is not taken');
        }
    }
    catch (err) {
        console.log('Error validating artpiece: ' + err);
        res.status(500).send("Internal server error");
    }
}

async function renderArtpiecePage(req, res, next) {
    try {
        console.log("Searching for artpiece with title: " + req.params.title);
        // Find the artpiece from the gallery
        const artpiece = await Gallery.findOne({ title: req.params.title });

        if (artpiece) {
            console.log("Found artpiece with title: " + artpiece.title);
            res.status(200).render('artpiece', { artpiece });
        }
        else {
            console.log("Artpiece with title " + req.params.title + ' not found');
            res.status(404).send('Artpiece not found');
        }
    }
    catch (err) {
        console.log("Error rendering artpiece page: " + err);
        res.status(500).send('Internal server error');
    }
}

async function renderSearch(req, res, next) {
    try {
        console.log('Rendering search');
        res.status(200).render('search-art');
    }
    catch (err) {
        console.log("Error rendering search: " + err);
        res.status(500).send("Internal server error");
    }
}

async function findArt(req, res, next) {
    try {
        console.log("Searching for artpieces that match: " + req.params.title + " " + req.params.category + " " + req.params.medium + " " + req.params.artist + " " + req.params.page);
        
        let filter = {};

        // For any filter that was entered, capitalize the first letter of each word in the filter and add to the filter
        if (req.params.title !== 'All') {
            let title = fixLetterCasing(req.params.title);
            filter.title = title;
        }
        if (req.params.category !== 'All') {
            let category = fixLetterCasing(req.params.category);
            filter.category = category;
        }
        if (req.params.medium !== 'All') {
            let medium = fixLetterCasing(req.params.medium);
            filter.medium = medium;
        }
        if (req.params.artist !== 'All') {
            let artist = fixLetterCasing(req.params.artist);
            filter.artist = artist;
        }

        // Find the artpieces from the gallery. Apply the filter to the search query
        const result = await Gallery.find(filter).skip(req.params.page * 10).limit(10);

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
        console.log("Error finding art: " + err);
        res.status(500).send('Internal server error');
    }
}

async function renderArtwork(req, res, next) {
    try {
        console.log('Searching for all artpieces');

        const artwork = await Gallery.find();

        if (artwork) {
            console.log("Artwork found. Rendering artwork page");
            res.status(200).render('artwork', { artwork });
        }
        else {
            console.log("Artwork not found!");
            res.status(404).send("Artwork not found!");
        }
    }
    catch (err) {
        console.log("Error rendering artpiece page: " + err);
        res.status(500).send("Internal server error");
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

async function postArtpiece(req, res, next) {
    try {
        const artwork = new Gallery(req.body); // Create the artwork from the data in the request body

        console.log("Saving art piece: " + artwork);
        await artwork.save() // Save the artwork to the gallery
        
        res.status(200).send("Artwork added successfully");
    }
    catch (err) {
        if (err.code === 11000) { // This indicates that there is a document in the collection that has the same key as the new document
            console.log("Error saving artwork:" + err);
            res.status(400).send('Artwork with this title already exists');
            return;
        }
        console.log("Error saving artwork: " + err);
        res.status(500).send("Internal server error");
    }
}

async function like(req, res, next) {
    try {
        console.log("Searching for artpiece with title: " + req.params.title);
        const artpiece = await Gallery.findOne({ title: req.params.title });

        if (artpiece) {
            console.log("Artpiece with title " + artpiece.title + " found");

            artpiece.likes++;
            await artpiece.save();
            
            res.status(200).send("Added like to artpiece successfully");
        }
        else {
            console.log("Artpiece with title " + req.params.title + " not found");
            res.status(404).send("Artpiece not found");
        }
    }
    catch (err) {
        console.log("Error adding like to artpiece");
        res.status(500).send("Internal server error");
    }
}

async function unlike(req, res, next) {
    try {
        console.log("Searching for artpiece with title: " + req.params.title);
        const artpiece = await Gallery.findOne({ title: req.params.title });

        if (artpiece) {
            console.log("Artpiece with title " + artpiece.title + " found");

            artpiece.likes--;
            await artpiece.save();
            
            res.status(200).send("Removed like from artpiece successfully");
        }
        else {
            console.log("Artpiece with title " + req.params.title + " not found");
            res.status(404).send("Artpiece not found");
        }
    }
    catch (err) {
        console.log("Error removing like from artpiece");
        res.status(500).send("Internal server error");
    }
}

async function postReview(req, res, next) {
    console.log("here");
    try {
        console.log("Searching for artpiece with title: " + req.params.title);
        const artpiece = await Gallery.findOne({ title: req.params.title });

        if (artpiece) {
            console.log("Artpiece with title " + artpiece.title + " found, posting review");
            
            const review = { username: req.session.username, review: req.body.review };
            artpiece.reviews.push(review);
            await artpiece.save();
            
            res.status(200).send('Successfully added review to art piece');
        }
        else {
            console.log("Artpiece with title " + req.params.title + " not found");
            res.status(404).send("Artpiece not found");
        }
    }
    catch (err) {
        console.log("Error adding review to art piece: " + err);
        res.status(500).send("Internal server error");
    }
}

async function deleteReview(req, res, next) {
    try {
        console.log("Searching for artpiece with title: " + req.params.title);
        let artpiece = await Gallery.findOne({ title: req.params.title });

        if (artpiece) {
            console.log("Artpiece with title " + artpiece.title + " found, deleting review");

            // Filter the reviews down to all the reviews that are not by that of the user with the provided username
            artpiece.reviews = artpiece.reviews.filter(review => review.username != req.session.username);
            await artpiece.save();

            res.status(200).send('Successfully deleted review from artpiece');
            return;
        }
        else {
            console.log('Artpiece not found');
            res.status(404).send('Artpiece not found');
            return;
        }
    }
    catch (err) {
        console.log('Error deleting review from artpiece: ' + err);
        res.status(500).send('Internal server error');
    }
}

module.exports = router;