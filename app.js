//imports
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const carOfferRoute = require('./api/routes/carOffer');
const personRoute = require('./api/routes/person');
const allowedHeaders = require('./api/utils/allowedHeaders');

//mongoDB connection
mongoose.connect('mongodb://localhost/bestcars')
    .then(() => console.log('Connected !'))
    .catch(() => console.log("Failed to connect to mongoDB"));

//log requests
app.use(morgan('dev'));

//make /uploads folder public available at localhost:8080/uploads/image_name
app.use('/uploads', express.static('uploads'));

//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//resolve cor errors
app.use(allowedHeaders.allowedHeaders);

//requests routes handlers
app.use('/car', carOfferRoute);
app.use('/person', personRoute);

//if a request makes it here then it is invalid
app.use((req, res, next) => {
    const error = new Error('Not found!');
    error.status = 404;
    next(error);//will forward the error request instead of the initial one
})

app.use((error, req, res , next) =>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;

