const express = require('express');
const register = require('../scheema/register');
const router = express.Router();
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const auth = require('../middleware/auth');
require('dotenv').config()

router.get('/', (req, res) => {
    req.session.message = {
        button_toggle: false
    }
    res.render("index",);
})

router.get('/addUser', (req, res) => {
    // req.session.message = {
    //     button_toggle: false
    // }
    res.render('addUser')
})
router.post('/add', async (req, res) => {
    // console.log(req.body);
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    if (password === cpassword) {
        const newUser = new register({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.number,
            password: req.body.password
        })
        //generating token
        const token = await newUser.generateAuthToken();
        console.log("the token part is " + token);

        // settignthe token in the cookie
        res.cookie("jwt", token, {
            //expires: new Date(Date.now()), //to expire the cookie after a given time period 30s in this case
            httpOnly: true
        });       //cookie set


        const result = await newUser.save()
        // console.log(req.body.password);
        if (result) {

            req.session.message = {
                message: 'user inserted succesfully',
                type: 'success'
            }
            res.redirect('users')
        }
        else {
            res.json({ message: err.message, type: 'danger' })
        }
    }
    else {
        res.render('addUser', { message: 'Passwords dosent match', type: 'danger' })

    }
})

//LOGIN ROUTES

router.get('/login', (req, res) => {
    req.session.message = {
        button_toggle: false
    }
    res.render('user_login');
})

router.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password

        const userInfo = await register.findOne({ email });
        // console.log(userInfo)
        const passwordCompare = await bcrypt.compare(password, userInfo.password);
        const token = await userInfo.generateAuthToken();


        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 600000), //to expire the cookie after a given time period 30s in this case
            httpOnly: true
            // ,secure:true 
        });       //cookie set

        // console.log(passwordCompare);
        if (passwordCompare) {
            req.session.message = {
                message: 'User logged in',
                type: 'success',
                button_toggle: true
            }
            res.redirect('users')

        }
        else {
            req.session.message = {
                message: 'wrong credentials',
                type: 'danger',
                strong: 'Sorry',
                button_toggle: false
            }
            res.redirect('login')
        }
    } catch (error) {
        // res.status(400).send('Invalid cresentials')
        req.session.message = {
            message: 'invalid credentials please try again',
            type: 'danger',
            strong: 'Sorry',
            button_toggle: false
        }
        res.redirect('login')
    }
})

router.get('/logout', auth, async (req, res) => {
    try {
        res.clearCookie("jwt");

        // req.user.tokens = req.user.tokens.filter((currElement)=>{
        //     return currElement.token != req.token    //only delete a particular token useful when u are logged in multiple devices
        // })

        req.user.tokens = [];

        console.log("logout succesfully");
        await req.user.save();
        // res.send("You are logged out");
        // res.redirect('/');

        req.session.message = {
            strong: 'You are logged out !',
            message: ' Please login to continue',
            type: 'warning'
        }
    } catch (error) {
        res.status(500).send(error);
    }
    res.redirect('/login');
})

router.get('/users', auth, (req, res) => {
    // console.log(`This is the cookie awesom ${req.cookies.jwt}`);
    register.find({}).exec((err, users) => {
        if (err) {
            res.json({ message: err.message });
        }
        else {
            res.render('usersList', {
                // message: true,
                user: users
            })

        }
    })
})

router.get('/edit/:id', (req, res) => {
    let id = req.params.id
    register.findById(id, (err, users) => {
        if (err)
            res.redirect('/')
        else {
            if (users == null)
                res.redirect('/')
            else {
                res.render('editUser', { user: users })
            }
        }
    })
})

router.post('/edit/:id', (req, res) => {
    let id = req.params.id;

    register.findByIdAndUpdate(id, {
        name: req.body.name,
        phone: req.body.number,
        email: req.body.email
    }, (err, result) => {
        if (err)
            res.json({ message: err.message, type: 'danger' })
        else {
            req.session.message = {
                message: 'user updated succesfully',
                type: 'success'
            }
            res.redirect('../users')
        }
    })
})

router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;
    register.findByIdAndDelete(id, (err, result) => {
        if (err)
            res.json({ message: err.message });
        // res.redirect('../users')

        else {
            req.session.message = {
                message: 'user deleted succesfully',
                type: 'danger'
            }
            res.redirect('../users')
        }
    })
})
module.exports = router