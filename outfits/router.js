const express = require('express');
const bodyParser = require('body-parser');

const { Outfit } = require('./models');
const passport = require('passport');
const jsonParser = bodyParser.json();

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });


router.post('/', jwtAuth, jsonParser, (req,res) => {
    const requiredFields = ['skintone', 'shirtColor', 'shirtType', 'longSleeveVisibility', 'shortSleeveVisibility', 'pantsColor', 'pantsType', 'shoesColor', 'userID'];
    const missingField = requiredFields.find(field => !(field in req.body));
    
    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: `Missing \`${missingField}\` in request body`,
            location: missingField
        });
    }

/*let {
  thingOne,
  thingTwo,
  ...
} = req.body */

    let skintone = req.body['skintone'];
    let shirtColor = req.body['shirtColor'];
    let shirtType = req.body['shirtType'];
    let longSleeveVisibility = req.body['longSleeveVisibility'];
    let shortSleeveVisibility = req.body['shortSleeveVisibility'];
    let pantsColor = req.body['pantsColor'];
    let pantsType = req.body['pantsType'];
    let shoesColor = req.body['shoesColor'];

    return Outfit.create({
        skintone,
        shirtColor,
        shirtType,
        longSleeveVisibility,
        shortSleeveVisibility,
        pantsColor,
        pantsType,
        shoesColor,
        user: req.user.id
    })
    .then(outfits => {
        console.log(outfits)
        return res.status(201).json(outfits.serialize())
    })
    .catch(err => {
        if (err.reason === 'ValidationError') {
            return res.status(err.code).json(err);
        }
        console.log(err);
        res.status(500).json({code: 500, message: `Internal server error: ${err}`});
    });
});

router.get('/', jwtAuth, (req, res) => {
    return Outfit.find({
        user: req.user.id
        })
        .then(outfits => res.json(outfits.map(outfit => outfit.serialize())))
        .catch(err => res.status(500).json({message: `Internal server error: ${err}`}));
});

router.get('/:id', (req, res) => {
    Outfit
        .findById(req.params.id)
        .then(outfit => {res.json(outfit.serialize())})
        .catch(err => res.status(404).json({message: `Internal server error: ${err}`}));
});

router.put('/:id', jwtAuth, (req,res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id and request body id values must match` + 
            `(${req.body.id}) must match`
        );
        console.error(message);
        return res.status(400).json({ message: message });
    }
    const toUpdate = {};
    const requiredFields = ['skintone', 'shirtColor', 'shirtType', 'longSleeveVisibility', 'shortSleeveVisibility', 'pantsColor', 'pantsType', 'shoesColor'];

    requiredFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });
    console.log(toUpdate)

    Outfit
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(() => {
        console.log(`Updating outfit \`${req.params.id}\``);
        res.status(204).end();
    })
    .catch((err) => 
    res.status(500).json({ message: `Internal server error ${err}` }));
});

router.delete('/:id', jwtAuth, (req, res) => {
    console.log(req.params.id);

    const id = req.params.id;

    Outfit
    .findByIdAndRemove(id)
    .then(() => {
        console.log(`You have deleted outfit id:${id}`);
        res.status(204).end();
    })
    .catch(err => res.status(500).json({ message: `Internal server error: ${err}` }));
});

module.exports = {router}