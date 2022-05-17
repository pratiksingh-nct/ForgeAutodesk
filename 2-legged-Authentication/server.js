const express = require('express')
var Axios = require('axios');   

const app = express();


const port = process.env.PORT || 3000

// import routes from './routes';
// import path from 'path';

app.use(express.json())
// app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

var scopes = 'data:read data:write';

const params = new URLSearchParams({
    client_id: 'VhynLQ1THkmBUwYVrfJQA2fOte4deg1p',
    client_secret: 'BG4DZIx7nFLqtQTq',
    grant_type: 'client_credentials',
    scope: scopes
})

var access_token = ''
// const querystring = require('querystring');

app.get('/api/forge/oauth', function (req, res) {
    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/authentication/v1/authenticate',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: params.toString()
    })
        .then(function (response) {
            // Success
            access_token = response.data.access_token;
            console.log(response);
            res.send('<p>Authentication success!</p>');
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Failed to authenticate');
        });
});

app.listen(port, () => {
    console.log(`server is running on port:${port}`)
})