const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');

const { router: usersRouter, outfitRouter } = require('./users');
const { router: authRouter, localStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const { PORT, CLIENT_ORIGIN } = require('./config');

const app = express();

app.use(cors({
    origin: CLIENT_ORIGIN
})
);


passport.use(localStrategy);
// passport.use(jwtStrategy);
// const PORT =  process.env.PORT || 3000;

// app.get('/api/*', (req,res) => {
//     res.json({ok: true});
// });

app.use('/api/users', usersRouter);

app.use('*', function(req, res) {
    res.status(404).json({ message: 'Page Not Found '});
});

const jwtAuth = passport.authenticate('jwt', { session: false});

app.get('/api/protected', jwtAuth, (req,res) => {
    return res.json({
        data: 'rosebud'
    });
});

let server;

// function runServer(databaseUrl = DATABASE_URL, port = PORT) {
//     return new Promise((resolve, reject) => {
//         mongoose.connect(databaseUrl, err => {
//             if (err) {
//                 return reject(err);
//             }
//             server = app.listen(port, () => {
//                 console.log(`Your app is listening on port ${port}`);
//                 resolve();
//             })
//             .on('error', err => {
//                 mongoose.disconnect();
//                 reject(err);
//             });
//         });
//     });
// }

// function closeServer() {
//     return mongoose.disconnect().then(() => {
//         return new Promise((resolve, reject) => {
//             console.log('Closing server');
//             server.close(err => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 resolve();
//             });
//         });
//     });
// }

// if (require.main === module) {
//     runServer().catch(err => console.error(err));
// }

// module.exports = { app, runServer, closeServer };

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app};