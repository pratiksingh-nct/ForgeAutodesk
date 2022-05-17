const express = require('express')  
const Axios = require('axios') 

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

var FORGE_CALLBACK_URL = 'http://localhost:3000/callback';

var scopes = 'data:read data:write';
// const params = new URLSearchParams()

// const params = new URLSearchParams({
//     client_id: 'VhynLQ1THkmBUwYVrfJQA2fOte4deg1p',
//     client_secret: 'BG4DZIx7nFLqtQTq',
//     grant_type: 'authorization_code',
//     code: req.query.code,
//     redirect_uri: FORGE_CALLBACK_URL
// })

// var access_token = ''
// const querystring = require('querystring');

app.get('/auth', function (req, res) {
    var redirect_uri = 'https://developer.api.autodesk.com/authentication/v1/authorize?'
    + 'response_type=code'
    + '&client_id=' + 'VhynLQ1THkmBUwYVrfJQA2fOte4deg1p'
    + '&redirect_uri=' + encodeURIComponent(FORGE_CALLBACK_URL)
    + '&scope=' + encodeURIComponent(scopes);
    res.redirect(redirect_uri)
});


// Creating Three-Legged Auth Token

app.get('/callback', function (req, res) {
    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/authentication/v1/gettoken',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams({
            client_id: 'VhynLQ1THkmBUwYVrfJQA2fOte4deg1p',
                client_secret: 'BG4DZIx7nFLqtQTq',
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: FORGE_CALLBACK_URL 
        }).toString()
    })
        .then(function (response) {
            // Success
            access_token = response.data.access_token;
            console.log(response);
            res.send('<p>Authentication success! Here is your token:</p>' + access_token);
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