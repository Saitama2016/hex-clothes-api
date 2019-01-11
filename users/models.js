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
    lastName: {type: String, default: ''},
    email: {
        type: String,
        default: ''
    }
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
    },
    userID: String
});

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

UserSchema.methods.serialize = function() {
    return {
        id: this._id,
        username: this.username || '',
        firstName: this.firstName || '',
        email: this.email
    };
};

OutfitSchema.methods.serialize = function() {
    return {
        id: this.id,
        skintone: this.skintone,
        shirt: this.shirt,
        pants: this.pants,
        shoes: this.shoes
    }
}

const User = mongoose.model('User', UserSchema);
const Outfit = mongoose.model('Outfit', OutfitSchema);

module.exports = { User, Outfit };