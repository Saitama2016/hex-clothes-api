const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');


const {closeServer, app, runServer} = require('../server');
const { Outfit } = require('../users');
const { TEST_DATABASE_URL } = require('../config');

const session = chai.request.agent(app)
const expect = chai.expect;
let token;
chai.use(chaiHttp);

describe('Outfit endpoints', function() {
    const skintone = '#ffad60';
    const shirt = "{type: long-sleeve-shirt, color: #FFF}";
    const pants = "{type: jeans, color: #0000ff}";
    const shoes = "{show: true, type: boots, color: #000}";
    const userID = "5c3634f44b80856a60b4eb08"

    before (function () {
        return runServer(TEST_DATABASE_URL);
    });

    after (function () {
        return closeServer();
    });

    beforeEach(function () {
            return session.post(`/api/users`)
                .send({username: 'HulkBuster2015', password: 'SaintSeiya2016'})
                .then(res => {token = res.body})
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
        return Outfit.remove({});
    });

    describe('/api/users/wardrobe/123', function() {
        it('Should reject with no credentials', function() {
            return chai
                .request(app)
                .post('/api/users/wardrobe/123')
                .send()
                .then((res) => {
                    expect(res.ok).to.equal(false);
                    expect(res).to.has.status(401);
                })
        });

        it('Should reject if wrong userID', function() {
            return chai
                .request(app)
                .post('/api/users/wardrobe/123')
                .send({skintone, shirt, pants, shoes, userID: "000001010"})
                .then((res) => {
                    expect(res).to.has.status(401);
                })
        });

        it('Should return valid outfit', function() {
            return chai.request(app)
            .get(`/api/users/wardrobe/5c3634f44b80856a60b4eb08`)
            .set('Authorization', `Bearer ${token}`)
            .then((res) => {
                console.log(res)
                expect(res).to.have.status(200);
                expect(res.body).to.be.an(object);
            })
        });

    });
});