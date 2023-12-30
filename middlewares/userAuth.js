const User = require('../models/userModel')


const isLogin = async (req, res, next) => {
    try {
        if (req.session.user) {
            const user = await User.findById(req.session.user);
  
            if (user && user.is_blocked === false) {
                next();
            } else {
                delete req.session.user;
                res.redirect(`/?message=you are blocked`);
            }
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if (req.session.user) {
            res.redirect('/users/home')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
 }
module.exports = {
    isLogin,
    isLogout
}
