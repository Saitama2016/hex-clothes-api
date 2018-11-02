const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const outfitSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    skintone: String,
    shirt: {
        type: String,
        color: String
    },
    pants: {
        type: String,
        color: String
    },
    shoes: {
        show: Boolean,
        type: String,
        color: String
    }
});

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {type: String, default: ''},
    lastName: {type: String, default: ''},
    email: {
        type: String,
        required: true,
        unique: true
    },
    wardrobe: [outfitSchema]
});

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};


const User = mongoose.model('User', UserSchema);
const Outfit = mongoose.model('Outfit', outfitSchema);

module.exports = { User, Outfit };