const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const OutfitSchema = mongoose.Schema({
    skintone: { 
        type: String,
        required: true
    },
    shirt: {
        type: String,
        color: String,
        required: true
    },
    pants: {
        type: String,
        color: String,
        required: true
    },
    shoes: {
        show: Boolean,
        type: String,
        color: String,
        required: true
    },
    user: {type: mongoose.SchemaTypes.ObjectId, ref: 'User'},
});

OutfitSchema.methods.serialize = function() {
    return {
        id: this.id,
        skintone: this.skintone,
        shirt: this.shirt,
        pants: this.pants,
        shoes: this.shoes,
    }
}

const Outfit = mongoose.model('Outfit', OutfitSchema);

module.exports = { Outfit }