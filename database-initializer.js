const mongoose = require('mongoose');
const fs = require('fs');
const Gallery = require('./ArtModel');
const User = require('./UserModel');

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
            // Makes sure that the first letter of each word in the attributes is capitalized
            artwork.Title = artwork.Title.split(' ');
            artwork.Title = artwork.Title.map(word => word.charAt(0).toUpperCase() + word.slice(1));
            artwork.Title = artwork.Title.join(' ');

            artwork.Category = artwork.Category.split(' ');
            artwork.Category = artwork.Category.map(word => word.charAt(0).toUpperCase() + word.slice(1));
            artwork.Category = artwork.Category.join(' ');

            artwork.Medium = artwork.Medium.split(' ');
            artwork.Medium = artwork.Medium.map(word => word.charAt(0).toUpperCase() + word.slice(1));
            artwork.Medium = artwork.Medium.join(' ');

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

        const result = await Gallery.insertMany(gallery); // Insert gallery list into Gallery collection
        console.log('Successfully inserted ' + result.length + ' artpieces to Gallery');
    }
    catch(err) {
        console.log('Error initializing Gallery: ' + err);
    }

    try {
        const gallery = await Gallery.find();
        let insertionCount = 0;

        for (let artpiece of gallery) {
            let splitName = artpiece.artist.split(' ');
            let firstname = splitName[0];
            let lastname = '';
            if (splitName.length == 2) {
                lastname = splitName[1];
            }
            else if (splitName.length == 3) {
                lastname = `${splitName[1]} ${splitName[2]}`;
            }

            // Combines all parts of the name and makes them lower case
            // e.g Vincent Van Gogh -> vincentvangogh
            let username = `${splitName.join('').toLowerCase()}`; 
            let password = username; // Make username and password the same for simplicity when testing

            const user = await User.findOne({ username: username });
            
            if (user) {
                user.artwork.push(artpiece.title);
                await user.save();
            }

            else {
                firstname = firstname.toLowerCase();
                firstname = firstname.charAt(0).toUpperCase() + firstname.slice(1);
                lastname = lastname.toLowerCase();
                lastname = lastname.charAt(0).toUpperCase() + lastname.slice(1);

                if (lastname.split(' ').length > 1) {
                    lastname = lastname.split(' ');
                    lastname[1] = lastname[1].toLowerCase();
                    lastname[1] = lastname[1].charAt(0).toUpperCase() + lastname[1].slice(1);
                    lastname = lastname.join(' ');
                }

                let userInfo = {
                    username: username,
                    password: password,
                    firstname: firstname,
                    lastname: lastname,
                    artist: true
                };

                let newUser = new User(userInfo);
                newUser.artwork.push(artpiece.title);

                const result = await newUser.save();

                if (result) {
                    insertionCount++;
                }
                else {
                    console.log("Error inserting users!");
                    break;
                }
            }
        }

        console.log("Successfully inserted " + insertionCount + " users into User");
    }
    catch(err) {
        console.log('Error initializing Users: ' + err);
    }

    await mongoose.disconnect();
});