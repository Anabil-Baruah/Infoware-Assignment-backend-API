const jwt = require("jsonwebtoken");
const register = require("../scheema/register");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        console.log(verifyUser);

        const user = await register.findOne({ _id: verifyUser._id });
        console.log(user.firstname);

        req.token = token;
        req.user = user;

        next();
    } catch (error) {
        // res.status(404).send(error);
        // res.render('user_login');
        req.session.message = {
            message: 'Login To continue',
            type: 'warning'
        }
        res.redirect('login')
    }
}

module.exports = auth;