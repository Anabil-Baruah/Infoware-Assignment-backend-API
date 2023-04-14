const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/node_crud");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config()              // so that we can use .env

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false
}))

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})


app.set("view engine", 'ejs');
app.use('', require('./routers/router'));
app.listen(4000);