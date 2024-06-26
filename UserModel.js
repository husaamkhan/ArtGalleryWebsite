const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId
const Schema = mongoose.Schema;

let userSchema = Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	firstname: {
		type: String,
		required: true
	},
	lastname: {
		type: String,
		default: ''
	},
	following: {
		type: [String],
		default: []
	},
	followers: {
		type: [String],
		ref: 'User',
		default: []
	},
	artist: {
		type: Boolean,
		default: false
	},
	artwork: {
		type: [String],
		default: []
	},
	workshopsHosted: {
		type: [String],
		ref: "Workshop",
		default: []
	},
	workshopsJoined: {
		type: [String],
		ref: "Workshop",
		default: []
	},
	notifications: {
		type: [String],
		default: []
	},
	likes: {
		type: [String],
		default: []
	},
	reviews: {
		type: [String],
		default: []
	}
});

module.exports = mongoose.model('User', userSchema);