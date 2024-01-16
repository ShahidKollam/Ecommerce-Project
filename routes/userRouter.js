const express = require('express');
const session = require('express-session')
const user_route = express();

const config = require('../config/configure')
const auth = require('../middlewares/userAuth')
const userController = require('../controller/userCtrl')
const cartController = require('../controller/cartCtrl')
const paymentController  = require('../controller/paymenCtrl')
const checkoutCtrl  = require('../controller/checkoutCtrl') 
const wishlistCtrl  = require('../controller/wishlistCtrl') 
const profileCtrl = require('../controller/profileCtrl')
const coupanCtrl = require('../controller/coupanCtrl')
const walletCtrl = require('../controller/walletCtrl')
const orderCtrl = require('../controller/orderCtrl')

user_route.use(session({ secret:config.userSession, resave:false, saveUninitialized:true }));
user_route.use(express.static('public'));

const flash = require('connect-flash')
user_route.use(flash());

user_route.set('view engine', 'ejs');
user_route.set('views','./views/users')      

user_route.get('/',auth.isLogout,userController.loadLandPage)
user_route.get('/login',auth.isLogout,userController.loginPage)
user_route.get('/logout',auth.isLogin,userController.logout)
//user_route.get('/verify-otp',userController.otpPage)
user_route.get('/users/home',auth.isLogin,userController.loadHome)
user_route.get('/register-page',auth.isLogout,userController.loadRegister)
//user_route.get('/resend-otp',userController.otpPage)
user_route.get('/users/search',auth.isLogin,userController.searchLoad) 
user_route.get('/users/filter',auth.isLogin,userController.loadFilter) 
user_route.get('/users/item-single',auth.isLogin,userController.singleItem) 

user_route.post('/login',auth.isLogout,userController.verifyLogin)
user_route.post('/register',auth.isLogout,userController.insertUser)
user_route.post('/verify-otp',auth.isLogout,userController.verifyOtp)
user_route.post('/resend-otp',auth.isLogout,userController.resendOTP)
user_route.post('/users/search',auth.isLogin,userController.search)
user_route.post('/users/filter',auth.isLogin,userController.filter) 

user_route.get('/users/edit-user',auth.isLogin,userController.editUser)
user_route.post('/users/edit-user',auth.isLogin,userController.updateUser)

user_route.get('/shop',auth.isLogin,userController.productList)


// forget password
user_route.get('/forget-password',auth.isLogout,userController.forgetLoad) 
user_route.post('/forget-password',auth.isLogout,userController.forgetVerify) 
user_route.get('/forgetPassword',auth.isLogout,userController.forgetPasswordLoad)
user_route.post('/reset-password',auth.isLogout,userController.resetPassword)

// Cart 
user_route.get('/add-to-cart',auth.isLogin,cartController.load_cart)
user_route.post('/add-to-cart',auth.isLogin,cartController.add_cart)
user_route.post('/cart-delete',auth.isLogin,cartController.delete_cart)
user_route.post('/cart-update',auth.isLogin,cartController.update_cart)

// Address & user-profile
user_route.get('/users/profile',auth.isLogin,profileCtrl.userProfile) 
user_route.get('/address',auth.isLogin,profileCtrl.new_address)
user_route.post('/address',auth.isLogin,profileCtrl.add_address)
user_route.get('/address/edit',auth.isLogin,profileCtrl.editAddress)
user_route.post('/address/edit',auth.isLogin,profileCtrl.updateAddress)
user_route.post('/address/delete/:addressId',auth.isLogin,profileCtrl.deleteAddress)
user_route.get('/changePassword',auth.isLogin,profileCtrl.changePassword)
user_route.post('/changePassword',auth.isLogin,profileCtrl.updatePassword)

// checkout
user_route.get('/checkout',auth.isLogin,checkoutCtrl.loadCheckout)
user_route.post('/place-order',auth.isLogin,checkoutCtrl.placeOrder)
user_route.get('/order-success',auth.isLogin,checkoutCtrl.orderSuccess)
user_route.post('/verify-coupon',auth.isLogin,coupanCtrl.verifyCoupon)
user_route.post('/get-coupon',auth.isLogin,coupanCtrl.getCoupon)

// order 
user_route.get('/order-history',auth.isLogin,orderCtrl.orderHistory)
user_route.post('/order-cancel',auth.isLogin,orderCtrl.cancelOrder)
user_route.post('/order-return',auth.isLogin,orderCtrl.returnOrder)
user_route.get('/order-details',auth.isLogin,orderCtrl.orderDetails)
// invoice download
user_route.get('/download/invoice/:order_id',orderCtrl.invoice)

// payment
user_route.get('/razorpay-payment',auth.isLogin,paymentController.loadPayment)
user_route.post('/razorpay',auth.isLogin,paymentController.createOrder)
user_route.post('/verify-payment',auth.isLogin,paymentController.verifyPayment)
user_route.get('/success-payment',auth.isLogin,paymentController.paymentSuccess)

//wallet
user_route.get('/wallet',auth.isLogin,walletCtrl.loadWallet)
user_route.post('/top-up',auth.isLogin,walletCtrl.top_up)
user_route.get('/wallet-pay',auth.isLogin,walletCtrl.walletPay)
user_route.get('/wallet-success',auth.isLogin,walletCtrl.orderSuccess)
user_route.get('/cancel-refund',auth.isLogin,walletCtrl.cancelAndRefund)

// wishlist
user_route.post('/add-wishlist',auth.isLogin,wishlistCtrl.addWishlist)
user_route.get('/wishlist',auth.isLogin,wishlistCtrl.loadWishlist)
user_route.post('/remove-item',auth.isLogin,wishlistCtrl.remove)

// referal
user_route.get('/referral',auth.isLogin,userController.referralPage)


module.exports = user_route            



// user_route.get('/verify',userController.verifyMail)    // know not using email link sent
