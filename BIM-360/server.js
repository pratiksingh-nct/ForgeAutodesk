var express = require('express');
const path = require('path');
// var {response} = require('express')
const cookieSession = require('cookie-session')

const PORT = process.env.PORT || 3000;


require('dotenv').config()

const config = require('./config');
if (config.credentials.client_id == null || config.credentials.client_secret == null) {
    console.error('Missing FORGE_CLIENT_ID or FORGE_CLIENT_SECRET env. variables.');
}

let app = express();
// response.cookie('cookie2', 'value2', { sameSite: 'none', secure: true })

app.set('view engine', 'ejs')

app.use(cookieSession({
    name: 'forge_session',
    keys: ['forge_secure_key'],
    // sameSite : 'none',
    // secure: true,
    // sameSite: 'lax',

    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days, same as refresh token
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false }));

app.use('/api/forge/', require('./routes/oauth'));
app.use('/api/forge', require('./routes/datamanagement'));
app.use('/api/forge', require('./routes/user'));
// app.use(mainRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode).json(err);
});


app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); })


