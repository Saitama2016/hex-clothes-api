const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');


const {closeServer, app, runServer} = require('../server');
const { Outfit } = require('../outfits');
const { TEST_DATABASE_URL } = require('../config');

const session = chai.request.agent(app)
const expect = chai.expect;
let token;
chai.use(chaiHttp);

describe.only('/api/outfits', function() {
    const username = "FinnAndJake2010";
    const password = "AdventureTime2018";
    const skintone = '#C68642';
    const shirt = `{type: "long-sleeve-shirt", color: "#FFF"}`;
    const pants = `{type: "jeans", color: "#0000ff"}`;
    const shoes = `{show: true, type: "boots", color: "#000"}`;

    before (function () {
        return runServer(TEST_DATABASE_URL);
    });

    after (function () {
        return closeServer();
    });

    beforeEach(function () {
            return session.post('/api/auth/login')
                .send({
                    "username": username, 
                    "password": password})
                .then(res => {
                    console.log(res);
                    token = res})
                .then(() => {
                return Outfit.create({
                        skintone,
                        shirt,
                        pants,
                        shoes
                    })
                })
    });

    afterEach(function () {
        return Outfit.remove({})
    });

    describe('/api/outfits', function() {
        it('Should reject with missing skintone', function() {
            return chai
                .request(app)
                .post('/api/outfits')
                .send({
                    shirt,
                    pants,
                    shoes
                })
                .then((res) => {
                    console.log(res)
                    expect(res.ok).to.equal(false);
                    expect(res).to.has.status(422);
                })
        });

        it('Should return valid outfit', function() {
            console.log(token)
            return chai.request(app)
            .get('/')
            .set('Authorization', `Bearer ${token}`)
            .then((res) => {
                // console.log(res)
                expect(res).to.have.status(200);
                expect(res.body).to.be.an(object);
            })
        });

    });
});