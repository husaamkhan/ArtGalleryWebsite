const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId
const Workshop = require('./WorkshopModel');
const express = require('express');
//Create the router
let router = express.Router();

router.get('/create-workshop', renderCreateWorkshop);

module.exports = router;