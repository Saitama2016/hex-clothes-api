const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const {closeServer, app, runServer} = require('../server');
const { Outfit } = require('../users');
const { TEST_DATABASE_URL } = require('../config');

const session = chai.request.agent(app)
const expect = chai.expect;
let token;
chai.use(chaiHttp);

describe('Outfit endpoints', function() {
    const skintone = '#c68642';
    const shirt = "{type: long-sleeve-shirt, color: #FFF}";
    const pants = "{type: jeans, color: #0000ff}";
    const shoes = "{show: true, type: boots, color: #000}";

    before (function () {
        return runServer(TEST_DATABASE_URL);
    });

    after (function () {
        return closeServer();
    });

    beforeEach(function () {
            return session.post('/api/auth/login')
                .send({
                    "username": "HulkBuster2015", 
                    "password": "SaintSeiya2016"})
                .then(res => {
                    console.log(res);
                    token = res})
                .then(() => {
                return Outfit.create({
                        skintone,
                        shirt,
                        pants,
                        shoes,
                        userID
                    })
                })
    });

    afterEach(function () {
        return new Promise((resolve, reject) => {
            console.warn('Deleting database');
            mongoose.connection.dropDatabase()
                .then(result => resolve(result))
                .catch(err => reject(err));
            });
    });

    describe('/api/users/wardrobe/:id', function() {
        it('Should reject with no credentials', function() {
            return chai
                .request(app)
                .post(`/api/users/wardrobe/${userID}`)
                .send()
                .then((res) => {
                    expect(res.ok).to.equal(false);
                    expect(res).to.has.status(401);
                })
        });

        it('Should reject if wrong userID', function() {
            return chai
                .request(app)
                .post(`/api/users/wardrobe/${userID}`)
                .send({skintone, shirt, pants, shoes, userID: "000001010"})
                .then((res) => {
                    expect(res).to.has.status(401);
                })
        });

        it('Should return valid outfit', function() {
            console.log(token)
            return chai.request(app)
            .get(`/api/users/wardrobe/${userID}`)
            .set('Authorization', `Bearer ${token}`)
            .then((res) => {
                // console.log(res)
                expect(res).to.have.status(200);
                expect(res.body).to.be.an(object);
            })
        });

    });
});