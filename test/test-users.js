const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, closeServer, runServer } = require('../server');
const { User } = require('../users');

const expect = chai.expect;

chai.use(chaiHttp);

describe('/api/user', function() {
    const username = 'exampleUser';
    const password = 'examplePass';
    const firstName = 'Example';
    const lastName = 'User';
    const usernameB = 'exampleUserB';
    const passwordB = 'examplePassB';
    const firstNameB = 'ExampleB';
    const lastNameB = 'UserB';

    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    beforeEach(function() {});

    afterEach(function() {
        return User.remove({});
    });
})