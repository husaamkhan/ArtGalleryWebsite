const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let workshopSchema = Schema({
    title: {
        type: String,
        required: true,
        unique: true,
      },
      artist: {
        type: String,
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

module.exports = mongoose.model("Workshops", workshopSchema);