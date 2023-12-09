const Gallery = require('./ArtModel');
const express = require('express');
//Create the router
let router = express.Router();

router.get('/add-artwork', renderAddArtwork);
router.get('/get-artpieces', sendArtpieces);
router.get('/validate-art/:title', validateArtpiece);
router.get('/view-art/:title', renderArtpiecePage);

router.post('/post-artpiece', postArtpiece);

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

async function validateArtpiece(req, res, next) {
    try {
        console.log('Searching for artpiece with title: ' + req.params.title);
        const result = await Gallery.findOne({ title: req.params.title });

        console.log(result);

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
        console.log(artpiece);
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

module.exports = router;