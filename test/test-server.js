const chai = require('chai');
const chaiHttp = require('chai-http');

const { closeServer, app, runServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

const should = chai.should();
chai.use(chaiHttp);

describe('API', function() {

    before (function () {
        return runServer(TEST_DATABASE_URL);
    });

    after(function () {
        return closeServer();
    });

    it('should 404 on GET requests', function() {
        return chai
            .request(app)
            .get('/api/foo')
            .then(function(res) {
                res.should.have.status(404);
                res.should.be.json;
            });
    });
});