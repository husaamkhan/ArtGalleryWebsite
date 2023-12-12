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
    uri: 'mongodb://127.0.0.1:27017/galleryDatabase', 
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
app.use('/user', userRouter);
let galleryRouter = require('./gallery-router');
app.use('/gallery', galleryRouter);
 
app.get('/', sendLogInPage);
app.get('/register', sendRegistrationPage);

app.use((req, res, next) => {
    res.status(404).render('page-not-found');
});

async function sendLogInPage(req, res, next) {
    if (req.session.loggedIn) { // If the user is already logged in, redirect them to their dashboard rather than making them log in again
        res.redirect('/user/dashboard');
        return;
    }

    console.log('Sending Log In page');
    res.status(200).render('logIn');
}

function sendRegistrationPage(req, res, next) {
    console.log('Sending Registration Page')
    res.status(200).render('register');
}

mongoose.connect('mongodb://127.0.0.1/galleryDatabase');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {8
    console.log('Connected to galleryDatabase database');
    app.listen(3000);
    console.log('Server listening on port 3000');
});