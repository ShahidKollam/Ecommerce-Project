const express = require('express')
const admin_route = express()
const session = require('express-session')

const categoryController = require('../controller/categoryCtrl')
const productController = require('../controller/productCtrl')
const adminController = require('../controller/adminCtrl')
const dashController = require('../controller/dashCtrl')
const coupanCtrl = require('../controller/coupanCtrl')
const bannerCtrl  = require('../controller/bannerCtrl')
const offerCtrl = require('../controller/offerCtrl')
const config = require('../config/configure')
const upload = require('../middlewares/multer')
const auth = require('../middlewares/adminAuth')

admin_route.use(session({ secret:config.adminSession, resave:false, saveUninitialized:true }));
admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin') 

admin_route.post('/admin',auth.isLogout,adminController.verifyLogin)
admin_route.post('/admin/add-user',auth.isLogin,adminController.saveUser)
admin_route.post('/admin/block-user',auth.isLogin,adminController.blockUser)
admin_route.post('/admin/add-category',auth.isLogin,categoryController.addCategory)
admin_route.post('/admin/edit-category',auth.isLogin,categoryController.updateCategory)
admin_route.post('/admin/delete-category',auth.isLogin,categoryController.deleteCategory)
admin_route.post('/admin/add-product',auth.isLogin,upload.upload.array('product_image',20),productController.saveProduct)
admin_route.post('/admin/edit-product',auth.isLogin,upload.upload.array('product_image',20),productController.updateProduct)
admin_route.post('/admin/block-product',auth.isLogin,productController.blockProduct)
 
admin_route.get('/admin',auth.isLogout,adminController.loadLogin)
admin_route.get('/admin/home',auth.isLogin,adminController.loadHome)
admin_route.get('/admin/logout',auth.isLogin,adminController.logout)
admin_route.get('/admin/get-user',auth.isLogin,adminController.getUser)
admin_route.get('/admin/add-user',auth.isLogin,adminController.addUser)

admin_route.get('/admin/category',auth.isLogin,categoryController.loadCategory)
admin_route.get('/admin/edit-category',auth.isLogin,categoryController.editCategory)
admin_route.get('/admin/products',auth.isLogin,productController.loadProducts)
admin_route.get('/admin/add-product',auth.isLogin,productController.addProducts)
admin_route.get('/admin/edit-product',auth.isLogin,productController.editProducts)

admin_route.get('/admin/chart',auth.isLogin,adminController.chart)

// Order
admin_route.get('/admin/orders',auth.isLogin,adminController.showOrder)
admin_route.get('/admin/order-details',auth.isLogin,adminController.orderDetails)
admin_route.post('/admin/update-order-status',auth.isLogin,adminController.updateStatus)

//sales
admin_route.get('/admin/sales',auth.isLogin,dashController.salesReport)
// admin_route.get('/admin/export',auth.isLogin,dashController.exportPDF)
admin_route.post('/admin/getOrdersByDate',auth.isLogin,dashController.filter)

// coupan
admin_route.get('/coupan',auth.isLogin,coupanCtrl.loadAddCoupon)
admin_route.get('/add-coupan',auth.isLogin,coupanCtrl.addCoupon)
admin_route.post('/add-coupan',auth.isLogin,coupanCtrl.saveCoupon)
admin_route.delete('/couponDelete/:couponId',auth.isLogin,coupanCtrl.deleteCoupon)
admin_route.get('/editCoupon',auth.isLogin,coupanCtrl.loadEditCoupon)
admin_route.post('/editCoupon',auth.isLogin,coupanCtrl.updateCoupon)

// offer 
admin_route.get('/product-offer',auth.isLogin,offerCtrl.productOffer)
admin_route.post('/product-discount',auth.isLogin,offerCtrl.updateOfferProduct)
admin_route.post('/category-offer',auth.isLogin,offerCtrl.updateOfferCat)
admin_route.get('/category-offer',auth.isLogin,offerCtrl.categoryOffer)
admin_route.get('/referal-offer',auth.isLogin,offerCtrl.referalOffer)

// banner
admin_route.get('/banner',auth.isLogin,bannerCtrl.loadBanner)
admin_route.get('/banner/add',auth.isLogin,bannerCtrl.addBanner)
admin_route.get('/banner/edit',auth.isLogin,bannerCtrl.editBanner)
admin_route.post('/banner/add',auth.isLogin,upload.upload.single('banner-image'),bannerCtrl.saveBanner)
admin_route.post('/banner/edit',auth.isLogin,upload.upload.single('banner-image'),bannerCtrl.updateBanner)
admin_route.post('/banner/block',auth.isLogin,bannerCtrl.blockBanner)


module.exports = admin_route