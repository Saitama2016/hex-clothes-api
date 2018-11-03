const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { closeServer, runServer, app } = require('../server');
const { User } = require('../users');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Auth endpoints', function () {
    const username = 'exampleUser';
    const password = 'examplePass';

    before (function () {
        return runServer(TEST_DATABASE_URL);
    });

    after(function () {
        return closeServer();
    });

    beforeEach(function () {
        return User.hashPassword(password).then(password => 
            User.create({
                username,
                password
            })    
        );
    });

    afterEach(function () {
        return User.remove({});
    });

    describe('/api/auth/login', function () {
        it('Should reject request with no credentials', function () {
            return chai
                .request(app)
                .post('/api/auth/login')
                .then(() => {}
                )
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(400);
                });
        });
        it('Should reject requests with incorrect usernames', function () {
            return chai
                .request(app)
                .post('/api/auth/login')
                .send({ username: 'wrongUsername', password })
                .then(() => {}
                )
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });    
        });
        it('Should reject requests with incorrect passwords', function () {
            return chai
                .request(app)
                .post('/api/auth/login')
                .send({ username, password: 'wrongPassword' })
                .then(() => {}
                )
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }

                    const res = err.response;
                    expect(res).to.have.status(401);
                });
        });
        it('Should return a valid auth token', function() {
            return chai
                .request(app)
                .post('/api/auth/login')
                .send({ username, password })
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    const token = res.body.authToken;
                    expect(token).to.be.a('string');
                    const payload = jwt.verify(token, JWT_SECRET, {
                        algorithms: ['HS256']
                    });
                    expect(payload.user).to.deep.equal({
                        username
                    });
                    expect(payload.exp).to.be.at.least(decoded.exp);
                });
        });
    });
});