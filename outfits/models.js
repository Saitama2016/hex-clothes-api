const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const OutfitSchema = mongoose.Schema({
    skintone: { 
        type: String,
        required: true
    },
    shirtColor: {
        type: String,
        required: true
    },
    shirtType: {
        type: String,
        required: true
    },
    longSleeveVisibility: {
        type: Boolean,
        required: true
    },
    shortSleeveVisibility: {
        type: Boolean,
        required: true
    },
    pantsColor: {
        type: String,
        required: true
    },
    pantsType: {
        type: String,
        required: true
    },
    shoesColor: {
        type: String,
        required: true
    },
    user: {type: mongoose.SchemaTypes.ObjectId, ref: 'User'},
});

OutfitSchema.methods.serialize = function() {
    return {
        id: this.id,
        skintone: this.skintone,
        shirtColor: this.shirtColor,
        shirtType: this.shirtType,
        longSleeveVisibility: this.longSleeveVisibility,
        shortSleeveVisibility: this.shortSleeveVisibility,
        pantsType: this.pantsType,
        pantsColor: this.pantsColor,
        shoesColor: this.shoesColor
    }
}

const Outfit = mongoose.model('Outfit', OutfitSchema);

module.exports = { Outfit }