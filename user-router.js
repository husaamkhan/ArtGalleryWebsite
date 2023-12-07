const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId
const User = require("./UserModel");
const express = require('express');
//Create the router
let router = express.Router();

router.post('/register', registerUser);

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

module.exports = router;