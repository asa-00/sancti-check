// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  username: String,
  creationDate: Date
});

module.exports = mongoose.model('User', userSchema);
