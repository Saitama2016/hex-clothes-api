const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

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
    lastName: {type: String, default: ''}
});

const OutfitSchema = mongoose.Schema({
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

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

UserSchema.methods.serialize = function() {
    return {
        username: this.username || '',
        firstName: this.firstName || '',
        lastName: this.lastName || ''
    };
};

OutfitSchema.methods.serialize = function() {
    return {
        skintone: this.skintone,
        shirt: this.shirt,
        pants: this.pants,
        shoes: this.shoes,
        userID: this.userID
    }
}

const User = mongoose.model('User', UserSchema);
const Outfit = mongoose.model('Outfit', OutfitSchema);

module.exports = { User, Outfit };