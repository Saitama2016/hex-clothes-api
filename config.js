const dbusername = process.env.dbusername
const dbpassword = process.env.dbpassword
const dbhost = process.env.dbhost
const dbport = process.env.dbport
const dbname = process.env.dbname
const testDBUsername = process.env.testDBUsername
const testDBPassword = process.env.testDBPassword
const testDBHost = process.env.testDBHost
const testDBPort = process.env.testDBPort
const testDBName = process.env.testDBName

exports.DATABASE_URL = `mongodb://${dbusername}:${dbpassword}@${dbhost}:${dbport}/${dbname}`;
exports.TEST_DATABASE_URL = `mongodb://${testDBUsername}:${testDBPassword}@${testDBHost}:${testDBPort}/${testDBName}`;
exports.PORT = process.env.PORT || 8080;
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '3600';