const mongoose = require("mongoose");
const fs = require("fs");
const Gallery = require("./ArtModel");
const User = require("./UserModel");
const Workshop = require("./WorkshopModel");

mongoose.connect('mongodb://127.0.0.1/myDatabase');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function () {
    await mongoose.connection.dropDatabase();

    try {
        const galleryData = fs.readFileSync("./gallery.json");
        const gallery = JSON.parse(galleryData);
        // const gallery = [];

        // for (artwork in parsedData) {
        //     let document = {
        //         title: artwork.Title,
        //         artist: artwork.Artist,
        //         year: artwork.Year,
        //         category: artwork.Category,
        //         medium: artwork.Medium,      
        //         description: artwork.Description,
        //         poster: artwork.Poster
        //     }

        //     gallery.push(document);
        // }

        const result = await Gallery.insertMany(gallery);
        console.log("Successfully inserted " + result.insertedCount + " art pieces to Gallery");
    }
    catch(err) {
        console.log("Error initializing Gallery: " + err);
    }

    try {
        const userData = fs.readFileSync("./users.json");
        const users = JSON.parse(userData);

        const result = await User.insertMany(users);
        console.log("Successfully inserted " + result.insertedCount + " users to Users");
    }
    catch(err) {
        console.log("Error initializing Users: " + err);
    }

    try {
        const result = await Workshop.create([]);
        console.log("Successfully created Workshop");
    }
    catch(err) {
        console.log("Error creating Workshop: " + err);
    }

    await mongoose.disconnect();
});
