const express = require('express');
const bodyParser = require('body-parser');
// const passport = require('passport');

// const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');
const {User, Outfit} = require('./models');

const router = express.Router();

// passport.use(localStrategy);
// passport.use(jwtStrategy);

// const jwtAuth = passport.authenticate('jwt', { session: false });

const jsonParser = bodyParser.json()

//Set up CRUD operations for users and outfits
//Post to register new user
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['username', 'password', 'firstName', 'lastName'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }

//     /*
//     If the username and password aren't trimmed we give an error. User might
//     expect that these will work without trimming (i.e. they want the password
//     "foobar ", including the space at the end).
//     */
    const explicityTrimmedFields = ['username', 'password'];
    const nonTrimmedField = explicityTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if (nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {
            min: 1
        },
        password: {
            min: 10,
            max: 72
        }
    };

    const tooSmallField = Object.keys(sizedFields).find(
        field =>
            'min' in sizedFields[field] &&
                req.body[field].trim().length < sizedFields[field].min
    );

    const tooLargeField = Object.keys(sizedFields).find(
        field => 
            'max' in sizedFields[field] &&
                req.body[field].trim().length > sizedFields[field].max
    );

    if (tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField
                ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
                : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let {username, password, firstName = '', lastName = ''} = req.body;

    firstName = firstName.trim();
    lastName = lastName.trim();

    return User.find({username})
        .count()
        .then(count => {
            if (count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username already taken',
                    location: 'username'
                });
            }
            return User.hashPassword(password);
        })
        .then(hash => {
            return User.create({
                username,
                password: hash,
                firstName,
                lastName
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            console.log('Failure', err)
            res.status(500).json({code: 500, message: 'Internal server error'});
        });
});

router.get('/', (req, res) => {
    return User.find()
        .then(users => res.json(users.map(user => user.serialize())))
        .catch(err => res.status(500).json({message: `Internal server error: ${err}`}));
});

router.get('/:username', (req, res) => {
    User
        .findById(req.params.username)
        .then(post => res.json(post.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: `Internal server error: ${err}` });
        });
});

router.delete('/:username', (req, res) => {
    console.log(req.params.username);
    User
        .findByIdAndRemove(req.params.username)
        .then(() => {
            console.log(`You have deleted username username:${req.params.username}`);
            res.status(204).end();
        })
        .catch(err => {
            console.error(err); 
            res.status(500).json({ 
                message: 'Internal server error' 
            })
        });
});

router.post('/wardrobe/:username', (req,res) => {
    const requiredFields = ['skintone', 'shirt', 'pants', 'shoes', 'userID'];
    const missingField = requiredFields.find(field => !(field in req.body));
    
    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const user = req.params.username;

    if(req.body.userID != user) {
        return res.status(500).json({
            code: 400,
            reason: 'ValidationError',
            message: 'id must match endpont',
            location: 'userID'
        });
    }

    let userID = req.body.userID;
    let skintone = req.body['skintone'];
    let shirt = req.body['shirt'];
    let pants = req.body['pants'];
    let shoes = req.body['shoes'];

    skintone = skintone.trim();
    shirt = shirt.trim();
    pants = pants.trim();
    shoes = shoes.trim();
    userID = userID.trim();

    return Outfit.create({
        skintone,
        shirt,
        pants,
        shoes
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

router.get('/wardrobe', (req, res) => {
    return Outfit.find()
        .then(outfits => res.json(outfits.map(outfit => outfit.serialize())))
        .catch(err => res.status(500).json({message: `Internal server error: ${err}`}));
});

router.get('/wardrobe/:username', (req, res) => {
    const user = req.params.username; 
    Outfit
        .find({
            userID: user
        })
        .then(outfits => res.json(outfits.map(outfit => outfit.serialize())))
        .catch(err => res.status(500).json({message: `Internal server error: ${err}`}));
});

router.get('/wardrobe/single/:id', (req, res) => {
    const id = req.params.id; 
    Outfit
        .findById(id)
        .then(outfit => res.json(outfit.serialize()))
        .catch(err => res.status(500).json({message: `Internal server error: ${err}`}));
});

router.put('/wardrobe/:id', (req,res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = (
            `Request path id and request body id values must match` + 
            `(${req.body.id}) must match`
        );
        console.error(message);
        return res.status(400).json({ message: message });
    }
    const toUpdate = {};
    const requiredFields = ['userID', 'skintone', 'shirt', 'pants', 'shoes'];

    requiredFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    Outfit
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(() => {
        console.log(`Updating user \`${req.params.id}\``);
        res.status(204).end();
    })
    .catch((err) => 
    res.status(500).json({ message: `Internal server error ${err}` }));
});

router.delete('/wardrobe/:id', (req, res) => {
    console.log(req.params.id);

    const outfitId = req.params.id;

    Outfit
    .findByIdAndRemove(outfitId)
    .then(() => {
        console.log(`You have deleted user vacation id:${outfitId}`);
        res.status(204).end();
    })
    .catch(err => res.status(500).json({ message: `Internal server error: ${err}` }));
});

module.exports = {router};