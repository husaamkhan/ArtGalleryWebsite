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
		type: [mongoose.Schema.Types.ObjectId],
		ref: "Artpiece",
		default: []
	},
	workshopsHosted: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: "Workshop",
		default: []
	},
	workshopsJoined: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: "Workshop",
		default: []
	},
	notifications: {
		type: [String],
		default: []
	}
});

module.exports = mongoose.model('User', userSchema);