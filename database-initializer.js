const mongoose = require('mongoose');
const fs = require('fs');
const Artpiece = require('./ArtModel');
const User = require('./UserModel');
const Workshop = require('./WorkshopModel');

mongoose.connect('mongodb://127.0.0.1/galleryDatabase');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
    await mongoose.connection.dropDatabase();
 
    try {
        const galleryData = fs.readFileSync('./gallery.json'); // Read in data from gallery.json
        const parsedData = JSON.parse(galleryData);
        const gallery = []; 

        // For each artpiece in gallery.json, create a document that contains its data, and push that document into the gallery list
        for (let artwork of parsedData) { 
            let document = {
                title: artwork.Title,
                artist: artwork.Artist,
                year: artwork.Year,
                category: artwork.Category,
                medium: artwork.Medium,      
                description: artwork.Description,
                poster: artwork.Poster
            }

            gallery.push(document);
        }

        const result = await Artpiece.insertMany(gallery); // Insert gallery list into Artpiece collection
        console.log('Successfully inserted ' + result.length + ' art pieces to Gallery');
    }
    catch(err) {
        console.log('Error initializing Gallery: ' + err);
    }

    try {
        const userData = fs.readFileSync('./users.json'); // Read in data from users.json
        const users = JSON.parse(userData); 

        const result = await User.insertMany(users); // Insert the users into the User collection 
        console.log('Successfully inserted ' + result.length + ' users to Users');
    }
    catch(err) {
        console.log('Error initializing Users: ' + err);
    }

    try {
        const result = await Workshop.create([]); // Create an empty Workshop collection
        console.log('Successfully created Workshop');
    }
    catch(err) {
        console.log('Error creating Workshop: ' + err);
    }

    await mongoose.disconnect();
});
