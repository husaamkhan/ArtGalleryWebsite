const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      dob: {
        type: Date,
        required: true,
      },
      following: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
      },
      followers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
      },
      artist: {
        type: Boolean,
        default: false,
      },
      artwork: {
        type: [String],
        default: [],
      },
      workshopsHosted: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Workshop',
        default: [],
      },
      workshopsJoined: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Workshop',
        default: [],
      }
});

userSchema.methods.findArtwork = function(callback) {
    this.model('Artwork').find()
    .where('Artist').equals(this.name)
    .exec
    .then(callback);
};

module.exports = mongoose.model('User', userSchema);