//Act as interface to export modules
//Create separate variables to export router and strategies
const {router} = require('./router')
const {localStrategy} = require('./strategies');

module.exports = {router, localStrategy};