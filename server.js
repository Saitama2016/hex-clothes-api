const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.Promise = global.Promise;

const { PORT, CLIENT_ORIGIN } = require('./config');

const app = express();

app.use(cors({
    origin: CLIENT_ORIGIN
})
);

const PORT =  process.env.PORT || 3000;

app.get('/api/*', (req,res) => {
    res.json({ok: true});
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app};