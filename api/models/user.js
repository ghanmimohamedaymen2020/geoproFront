const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true },
    role: { type: String, required: true},
    password: { type: String, required: true },
    encodedPassword: { type: String }
});

module.exports = mongoose.model("User", userSchema);