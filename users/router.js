const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');
const {User, Outfit} = require('./models');

const router = express.Router();

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(bodyParser.json());

router.post('/', (req, res) => {
    const requiredFields = ['username', 'password', 'firstName', 'lastName', 'email'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const stringFields = ['username', 'password', 'firstName', 'lastName', 'email'];
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

    /*
    If the username and password aren't trimmed we give an error. User might
    expect that these will work without trimming (i.e. they want the password
    "foobar ", including the space at the end).
    */
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

    let {username, password, firstName = '', lastName = '', email = ''} = req.body;

    firstName = firstName.trim();
    lastName = lastName.trim();
    email = email.trim();

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
                lastName,
                email
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal server error'});
        });
});

// Set up router for outfits

//Set up CRUD operations for users and outfits
router.get('/', (req, res) => {
    return User.find()
        .then(users => res.json(users.map(user => user.serialize())))
        .catch(err => res.status(500).json({message: `Internal server error: ${err}`}));
});

router.get('/:id', (req, res) => {
    User
        .findById(req.params.id)
        .then(post => res.json(post.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: `Internal server error: ${err}` });
        });
});

router.delete('/:id', (req, res) => {
    console.log(req.params.id);
    User
        .findByIdAndRemove(req.params.id)
            .then(() => {
                console.log(`You have deleted post id:${req.params.id}`);
            })
            .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

module.exports = {router};