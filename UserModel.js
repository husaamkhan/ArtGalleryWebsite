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
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'User',
		default: []
	},
	followers: {
		type: [mongoose.Schema.Types.ObjectId],
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
	}
});

module.exports = mongoose.model('User', userSchema);