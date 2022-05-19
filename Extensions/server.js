var express = require('express');
const path = require('path');

require('dotenv').config()

let app = express();

const PORT = process.env.PORT || 3000;

const config = require('./config');
if (config.credentials.client_id == null || config.credentials.client_secret == null) {
    console.error('Missing FORGE_CLIENT_ID or FORGE_CLIENT_SECRET env. variables.');
    // return;
}

// const mainRouter = require('./routes/oauth');

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false }));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode).json(err);
});

// app.use(mainRouter);

app.use('/api/forge/oauth', require('./routes/oauth'));
app.use('/api/forge/oss', require('./routes/oss'));
app.use('/api/forge/modelderivative', require('./routes/modelderivative'));


app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); })


