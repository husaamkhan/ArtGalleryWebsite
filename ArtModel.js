const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let artworkSchema = Schema({
      title: {
        type: String,
        required: true,
        unique: true
      },
      artist: {
        type: String,
        required: true
      },
      year: {
        type: Number,
        required: true
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
        default: ''
      },
      poster: {
        type: String,
        required: true
      },
      likes: {
        type: Number,
        default: 0
      },
      reviews: {
        type: [
          {
            username: String,
            review: String
          }
        ],
        default: []
      }
});

module.exports = mongoose.model('Artpiece', artworkSchema);