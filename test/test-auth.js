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
    const email = 'example@gmail.com';

    before (function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return User.hashPassword(password).then(password => 
            User.create({
                username,
                password,
                email
            })    
        );
    });

    afterEach(function () {
        return User.remove({});
    });

    after(function () {
        return closeServer();
    });

    describe('/api/auth/login', function () {
        it('Should reject request with no credentials', function () {
            return chai
                .request(app)
                .post('/api/auth/login')
                .then((res) => {
                    expect(res.ok).to.equal(false);
                    expect(res).to.have.status(400);
                });
        });
        it('Should reject requests with incorrect usernames', function () {
            return chai
                .request(app)
                .post('/api/auth/login')
                .send({ username: 'wrongUsername', password })
                .then((res) => {
                    expect(res).to.have.status(401);
                });    
        });
        it('Should reject requests with incorrect passwords', function () {
            return chai
                .request(app)
                .post('/api/auth/login')
                .send({ username, password: 'wrongPassword' })
                .then((res) => {
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
                    expect(payload.user.username).to.equal(
                        username
                    );
                    expect(payload.exp).to.be.greaterThan(payload.iat);
                });
        });
    });
});