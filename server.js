const express = require('express');
const app = express();

app.set('views', 'public');
app.use(express.static('public'));
app.set('view engine', 'pug');
app.use(express.json());

const mongoose = require('mongoose');

const session = require('express-session'); 
const MongoDBGallery = require('connect-mongodb-session')(session); 

const gallery = new MongoDBGallery({ 
    uri: 'mongodb://127.0.0.1:27017/store', 
    collection: 'sessiondata' 
}); 

app.use(session({  
    secret: 'some secret key here',  
    resave: true, 
    saveUninitialized: true, 
    gallery: gallery,
}));

app.use(function (req, res, next) { 
    console.log(req.session); 
    next(); 
});

let userRouter = require('./user-router');
app.use('/users', userRouter);
// let galleryRouter = require('./gallery-router');
// app.use('/galleries', galleryRouter);
// let workshopRouter = require('./workshop-router');
// app.use('/workshops', workshopRouter);
 
app.get('/', sendLogInPage);
app.get('/register', sendRegistrationPage);

async function sendLogInPage(req, res, next) {
    if (req.session.loggedIn) {
        res.redirect('/users/dashboard');
        return;
    }

    console.log('Sending Log In page');
    res.status(200).render('logIn');
}

function sendRegistrationPage(req, res, next) {
    console.log('Sending Registration Page')
    res.status(200).render('register');
}

mongoose.connect('mongodb://127.0.0.1/gallaryDatabase');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to galleryDatabase database');
    console.log('Server listening on port 3000');
    app.listen(3000);
});