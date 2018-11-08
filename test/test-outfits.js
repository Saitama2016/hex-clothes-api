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
    const shirt = "{type: 'long-sleeve-shirt', color: '#FFF'}";
    const pants = "{type: 'jeans', color: '#0000ff'}";
    const shoes = "{show: true, type: 'boots', color: '#000'}";

    this.timeout(3000);

    // before (function () {
    //     return runServer(TEST_DATABASE_URL);
    // });

    // after (function () {
    //     return closeServer();
    // });

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
        it('Should reject with no credentials', function(done) {
            return chai
                .request(app)
                .post('/api/users/wardrobe')
                .then(() => {}
                )
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(400);
                    done();
                })
        });


    });
});