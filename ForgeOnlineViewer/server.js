var express = require('express');
const path = require('path');

require('dotenv').config()

let app = express();


const PORT = process.env.PORT || 3000;
const mainRouter = require('./routes/index');

// dotenv.config()
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(mainRouter);


app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); })


