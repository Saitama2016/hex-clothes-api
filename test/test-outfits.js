const chai = require('chai');
const chaiHttp = require('chai-http');


const {closeServer, app, runServer} = require('../server');
const { Outfit } = require('../users');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Outfit endpoints', function() {
    const username = 'exampleUser';
    const skintone = '#ffad60';
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
        return Outfit.create({
            username,
            skintone,
            shirt,
            pants,
            shoes
        })
    });

    afterEach(function () {
        return Outfit.remove({});
    });

    describe('/api/users/wardrobe', function() {
        it('Should reject with no credentials', function() {
            return chai
                .request(app)
                .post('/api/users/wardrobe')
                .send()
                .then((res) => {
                    expect(res.ok).to.equal(false);
                    expect(res).to.has.status(401);
                })
        });

        it('Should reject if wrong user name', function() {
            return chai
                .request(app)
                .post('/api/users/wardrobe')
                .send({username: "wrongUser", skintone, shirt, pants, shoes})
                .then((res) => {
                    expect(res).to.has.status(401);
                })
        });

        it('Should return valid outfit', function() {
            return chai
                .request(app)
                .get(`/api/users/wardrobe/${outfit}`)
                .send({username, skintone, shirt, pants, shoes})
                .then((res) => {
                    console.log(res.body);
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an(object);
                })
        });

    });
});