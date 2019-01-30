const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const {closeServer, app, runServer} = require('../server');
const { User } = require('../users');
const { Outfit } = require('../outfits');
const { TEST_DATABASE_URL } = require('../config');

const session = chai.request.agent(app)
const expect = chai.expect;
let token;
chai.use(chaiHttp);

function tearDownDb() {
    return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
        .then(result => resolve(result))
        .catch(err => reject(err));
    });
}

describe.only('/api/users/:id/outfits', function() {
    const username = 'exampleUser';
    const password = 'examplePass';
    const hash = User.hashPassword(password);
    const email = 'example@gmail.com';
    const skintone = '#C68642';
    const shirt = `{type: "long-sleeve-shirt", color: "#FFF"}`;
    const pants = `{type: "jeans", color: "#0000ff"}`;
    const shoes = `{show: true, type: "boots", color: "#000"}`;

    before (function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return User.hashPassword(password)
        .then(hash => 
             User.create({
                username,
                password: hash,
                email
            })
        )
        .then((username, password) => {
            return session.post('/api/auth/login')
                .send({username, password})
                .then(res => token = res)
                .then((token) => {
                    console.log(token)
                return Outfit.create({
                        skintone,
                        shirt,
                        pants,
                        shoes
                    })
                })
            })
    });

    afterEach(function () {
        return tearDownDb();
    });

    after (function () {
        return closeServer();
    });

    describe('/api/users/:id/outfits', function() {
        it('Should reject with missing skintone', function() {
            return chai
                .request(app)
                .post('/api/users/:id/outfits')
                .send({
                    shirt,
                    pants,
                    shoes
                })
                .then((res) => {
                    expect(res.ok).to.equal(false);
                    expect(res).to.has.status(422);
                })
        });

        it('Should return valid outfit', function() {
            return chai.request(app)
            .get('/api/users/:id/outfits')
            .set('Authorization', `Bearer ${token}`)
            .then((res) => {
                // console.log(res)
                expect(res).to.have.status(200);
                expect(res.body).to.be.an(object);
            })
        });

    });
});