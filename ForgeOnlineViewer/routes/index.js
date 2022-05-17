const express = require('express');
const router = express.Router();
var Axios = require('axios'); 

var buff = require('buffer').Buffer;

String.prototype.toBase64 = function () {
    // Buffer is part of Node.js to enable interaction with octet streams in TCP streams, 
    // return new Buffer(this).toString('base64');
    return Buffer.from(this).toString('base64');
};



var FORGE_CLIENT_ID = process.env.FORGE_CLIENT_ID;
var FORGE_CLIENT_SECRET = process.env.FORGE_CLIENT_SECRET;
var access_token = '';
var scopes = 'data:read data:write data:create bucket:create bucket:read';

router.get('/', (req, res) => {
    res.render('index');
    // console.log(FORGE_CLIENT_ID)
});



// Route /api/forge/oauth/public
router.get('/api/forge/oauth/public', function (req, res) {
    // Limit public token to Viewer read only
    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/authentication/v1/authenticate',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams({
            client_id: FORGE_CLIENT_ID,
            client_secret: FORGE_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'viewables:read'
        }).toString()
    })
        .then(function (response) {
            // Success
            console.log(response);
            res.json({ access_token: response.data.access_token, expires_in: response.data.expires_in });
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.status(500).json(error);
        });
});


router.get('/api/forge/oauth', function (req, res) {
    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/authentication/v1/authenticate',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams({
            client_id: FORGE_CLIENT_ID,
            client_secret: FORGE_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: scopes
        }).toString()
    })
        .then(function (response) {
            // Success
            access_token = response.data.access_token;
            // console.log(response);
            res.redirect('/api/forge/datamanagement/bucket/create');
        })
        .catch(function (error) {
            // Failed
            // console.log(error);
            res.send('Failed to authenticate');
        });
});

const bucketKey = FORGE_CLIENT_ID.toLowerCase() + '_tt_bucket'; // Prefix with your ID so the bucket key is unique across all buckets on all other accounts
const policyKey = 'transient'; // Expires in 24hr

// Route /api/forge/datamanagement/bucket/create
router.get('/api/forge/datamanagement/bucket/create', function (req, res) {
    // Create an application shared bucket using access token from previous route
    // We will use this bucket for storing all files in this tutorial
    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/oss/v2/buckets',
        headers: {
            'content-type': 'application/json',
            Authorization: 'Bearer ' + access_token
        },
        data: JSON.stringify({
            'bucketKey': bucketKey,
            'policyKey': policyKey
        })
    })
        .then(function (response) {
            // Success
            // console.log(response);
            res.redirect('/api/forge/datamanagement/bucket/detail');
        })
        .catch(function (error) {
            if (error.response && error.response.status == 409) {
                console.log('Bucket already exists, skip creation.');
                res.redirect('/api/forge/datamanagement/bucket/detail');
            }
            // Failed
            // console.log(error);
            res.send('Failed to create a new bucket');
        });
})


// Route /api/forge/datamanagement/bucket/detail
router.get('/api/forge/datamanagement/bucket/detail', function (req, res) {
    Axios({
        method: 'GET',
        url: 'https://developer.api.autodesk.com/oss/v2/buckets/' + encodeURIComponent(bucketKey) + '/details',
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    })
        .then(function (response) {
            // Success
            // console.log(response);
            res.redirect('/upload');
        })
        .catch(function (error) {
            // Failed
            console.log('ye h err',error);
            res.send('Failed to verify the new bucket');
        });
});

router.get('/upload', (req,res)=>{
    res.render('upload')
})



var multer = require('multer');         // To handle file upload
var upload = multer({ dest: 'uploads/' }); // Save file into local /tmp folder


router.post('/api/forge/datamanagement/bucket/upload', upload.single('viewer'), function (req, res) {
    var fs = require('fs'); // Node.js File system for reading files
    fs.readFile(req.file.path, function (err, filecontent) {
        Axios({
            method: 'PUT',
            url: 'https://developer.api.autodesk.com/oss/v2/buckets/' + encodeURIComponent(bucketKey) + '/objects/' + encodeURIComponent(req.file.originalname),
            headers: {
                Authorization: 'Bearer ' + access_token,
                'Content-Disposition': req.file.originalname,
                'Content-Length': filecontent.length
            },
            data: filecontent
        })
            .then(function (response) {
                // Success
                console.log(response);
                var urn = response.data.objectId.toBase64();
                res.redirect('/api/forge/modelderivative/' + urn);
            })
            .catch(function (error) {
                // Failed
                console.log(error);
                res.send('Failed to create a new object in the bucket');
            });
    });
});


router.get('/api/forge/modelderivative/:urn',(req,res)=>{
    var urn = req.params.urn
    var format_type = 'svf';
    var format_views = ['2d', '3d']

    Axios({
        method: 'POST',
        url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/job',
        headers: {
            'content-type': 'application/json',
            Authorization: 'Bearer ' + access_token
        },
        data: JSON.stringify({
            'input': {
                'urn': urn
            },
            'output': {
                'formats': [
                    {
                        'type': format_type,
                        'views': format_views
                    }
                ]
            }
        })
    })
        .then(function (response) {
            // Success
            console.log(response);
            res.redirect('/viewer.html?urn=' + urn);
        })
        .catch(function (error) {
            // Failed
            console.log(error);
            res.send('Error at Model Derivative job.');
        });
})




module.exports = router;