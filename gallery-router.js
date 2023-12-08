const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId
const Gallery = require('./ArtModel');
const express = require('express');
//Create the router
let router = express.Router();

router.get('/add-artwork', renderAddArtwork);

router.post('/post-artpiece', postArtpiece);

function renderAddArtwork(req, res, next) {
    console.log('Rendering add artwork');
    if (req.session.loggedIn) {
        res.status(200).render('add-artwork');
        return;
    }
    else {
        console.log("Error: Not logged in");
        res.status(404).redirect('/');
        return;
    }
}

async function postArtpiece(req, res, next) {
    try {
        const artwork = new Gallery(req.body);

        console.log("Saving art piece: " + artwork);
        await artwork.save()

        res.status(200).send("Artwork added successfully");
    }
    catch (err) {
        console.log("Error saving artwork: " + err);
        res.status(500).send("Internal server error");
    }
}

module.exports = router;