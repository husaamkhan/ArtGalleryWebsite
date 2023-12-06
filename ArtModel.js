const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let artworkSchema = Schema({
      title: {
        type: String,
        required: true,
        unique: true,
      },
      artist: {
        type: String,
        required: true,
      },
      year: {
        type: Number,
        required: true,
      },
      category: {
        type: String,
        required: true
      },
      medium: {
        type: String,
        required: true
      },      
      description: {
        type: String,
        required: false
      },
      poster: {
        type: String,
        required: true
      }
});

artworkSchema.methods.findArtwork = function(callback) {
    this.model("Artwork").find()
    .where("Artist").equals(this.name)
    .exec
    .then(callback);
};

module.exports = mongoose.model("Gallery", artworkSchema);