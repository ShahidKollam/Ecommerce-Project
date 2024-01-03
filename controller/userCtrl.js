const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Address = require('../models/addressModel')
const Wallet = require('../models/walletModel')
const config = require('../config/configure')
const bcrypt = require('bcrypt')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const nodemailer = require('nodemailer')
const otpGenerater = require('otp-generator')
const randomstring = require('randomstring');
const Banner = require('../models/bannerModel')

let otpStore = {}

const verifyOtp = async(req,res)=>{
    try {
        const enteredOtp = req.body.otp
        const userEmail = req.body.email;
        const storedOtp = otpStore[userEmail]
        
        console.log(enteredOtp,"( Deleted after verify )");
        console.log(storedOtp);
        console.log(userEmail);

        if(storedOtp && Date.now() <= storedOtp.expDate){ 
            if (enteredOtp === storedOtp.otp) {
            const updateInfo = await User.updateOne({email:req.body.email},{$set:{is_verified:1}})
            console.log(updateInfo);
            delete otpStore[userEmail]
            res.json({success: true})
        } else {
            const message = 'OTP Invalid';
            res.json({error: 'OTP Invalid'})
        } 
    } else {
        const message = 'OTP Expired. Please Resend OTP'; 
        res.json({error: message})
    }
    } catch (error) {
        console.log(error.message);
    }
}

const otp = function generateOTP(userEmail) {
    const otpNum = otpGenerater.generate(4, { digits: true, alphabets: false, specialChars: false });
    const expDate = Date.now() + 1 * 60 * 1000;
    otpStore[userEmail] = { otp:otpNum, expDate }
    return otpNum
}
  
const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash

    } catch (error) {
        console.log(error.message);
    } 
}  

const sendOtp = async(email,otp)=>{ 
    try {
        const transporter = nodemailer.createTransport({
            service:'Gmail',
            auth:{
                user:config.emailUser ,
                pass:config.emailPassword
            }
        })
        const mailOptions = {
            from:config.emailUser,
            to:email,
            subject:"Your OTP code",
            text:`Please don't share Your OTP code to anyone. \n Your OTP code is ${otp} \n OTP valid for 1 minute only.`
        }
        transporter.sendMail(mailOptions,(error,info)=>{
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent successfully ',mailOptions);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}    

const otpPage = async(req,res)=>{
    try {
        const userEmail = req.query.email;
        res.render('email-verified',{userEmail})
    } catch (error) {
        console.log(error.message);
    }
}

const sendVerifyMail = async(name,email,user_id)=>{
    try {
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{ 
                user:config.emailUser,
                pass:config.emailPassword                         // 'kdkt samg gqka skhk'
            }
        })
        const mailOptions = {
            from:config.emailUser,
            to:email,
            subject:'For Verification Email',
            html:'<p>Hi ' + name + ',please click here to <a href="http://localhost:5000/verify?id='+user_id+'"> Verify </a> your mail.</p> '
        }
        transporter.sendMail(mailOptions, function(error,info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent:-',info.response);
            }  
        })
    } catch (error) {
        console.log(error.message);
    }
}

const verifyMail = async(req,res)=>{
    try {
        const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1}})
        console.log(updateInfo);
        res.render('email-verified')
    } catch (error) {
        console.log(error.message);
    }
}

const loadLandPage = async(req,res)=>{
    try {
        if (req.session.user) {
             res.redirect('/users/home');
        } else {
            res.render('landing_page')       
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loginPage = async(req,res)=>{
    try {
        if (req.session.user) {
             res.redirect('/users/home');
        } else {
            res.render('login')       
        }
    } catch (error) {
        console.log(error.message);
    }
}

const insertUser = async(req,res)=>{
    try {
        console.log(req.body);
        const referedCode = req.body.referralCode;
        
        const emailMatch = await User.findOne({email:req.body.email})
        if(emailMatch){
            console.log("email matched");
             res.json({ error: 'Email already exists' });

        }else if(req.body.password !== req.body.cpassword){
             res.status(200).json({ error: 'Passwords do not match' });
        }else{  
        const referralCode = generateRandomString()
        const spassword = await securePassword(req.body.password)
        const user = new User({
            name : req.body.name,
            email : req.body.email,
            mobile : req.body.mno,
            password : spassword,
            is_admin : 0,
            is_verified:0,
            is_blocked: false,
            referralCode: referralCode,
        }); 
        const userData = await user.save();


        if (referedCode) {
           // Find the referring user using the referral code
            const referringUser = await User.findOne({ referralCode: referedCode });
            const id = referringUser._id;
            console.log("referringUser",referringUser);
            if (referringUser) {
                console.log("ref",referringUser)
                referringUser.referralHistory.push({
                referredUserId: userData._id,
            });
            await referringUser.save();
             
            const walletUpdate = await Wallet.findOneAndUpdate(
                { user_id: id },
                {
                    $inc: { walletAmount: 1000 },
                    $push: {
                        transactions: {
                            type: 'Referral Credit',
                            amount: 1000,
                            date: new Date(),
                        },
                    },
                },
                { new: true }
            );
    
            console.log(walletUpdate);

            }
          }
        

        if (userData) {
            const userEmail = req.body.email;
            sendOtp(userEmail, otp(userEmail));
         // sendVerifyMail(req.body.name, req.body.email, userData._id)

            res.json({ success: true, message: 'Your Account Verified Successfully', email: userEmail });
        } else {
            res.json({ success: false, message: 'Registration failed' });
        }

    }
    } catch (error) {
        console.log(error.message);
    }
}    

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email})
        if (userData) {
            if (userData.is_blocked) {
                res.render('login', { message: 'Your account is blocked. Please contact support.' });
            } else { 
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if (passwordMatch) {
                req.session.user = userData._id;
                req.session.name = userData.name;
                req.session.userType = 'user';
                res.redirect('/users/home');
            } else {
                res.render('login',{message:'Password is incorrect'})
            }}
        } else {
            res.render('login',{message:'Give correct Email '})
        }
        //res.render('user_home'); 
    } catch (error) {
        console.log(error.message);
    }
}    

const referralPage = async(req,res)=>{
    try { 
        const user = req.session.name
        const id = req.session.user
        const userFind = await User.findById(id);
        const referralCode = userFind.referralCode;
        res.render('referal',{
            user,
            referralCode
        })
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async(req,res)=>{
    try {
        const productData = await Product.find().populate("category")
        const category = await Category.find();
        const user = req.session.name
        const message = req.query.message
        const banners = await Banner.find()
        const imageUrl = []
            for (const product of productData){
                 const images = await Promise.all(
                    product.image.map(async(image) => {
                        const FullImageUrl = await cropImage(image);
                        return FullImageUrl
                }))
                imageUrl.push(images)
            }
        
        if(user){
            res.render('user_home',{ 
                user,
                products:productData,
                imageUrl,
                category,
                message,
                banners,
            });

        }else{ 
            res.redirect("/login");
        }
    } catch (error) { 
        console.log(error.message);
    }
} 

const cropImage = async(image)=>{
    try {
        const imageFilePath = path.join(__dirname, '../public', 'product-images', `${image.filename}`);     
        const sharpImage = sharp(imageFilePath);
    
        const croppedImageBuffer = await sharpImage
            .resize(200, 250) 
            .rotate()// Adjust dimensions as needed
            .toBuffer();
            const croppedImageDir = path.join(__dirname, '../public/product-images');
            const croppedImageName = `cropped_${image.filename}`;
            const croppedImagePath = path.join(croppedImageDir, croppedImageName);
            const croppedRelativePath = `/product-images/${croppedImageName}`; // Construct the relative URL

        fs.writeFileSync(path.join(croppedImagePath), croppedImageBuffer);
        return croppedRelativePath;
    } catch (error) {
        console.log(error.message);
    }
}

const logout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async(req,res)=>{
    try {
        res.render('registration')
    } catch (error) {
        console.log(error.message);
    }
}

const resendOTP = async(req,res)=>{
    try {
        const userEmail = req.body.email
        sendOtp(userEmail, otp(userEmail));
        res.json({success: true})
    } catch (error) { 
        console.log(error.message);
    }
}  
 
const searchLoad = async(req,res)=>{
    try {
        console.log(req.query);

        const user = req.session.name
        const searchWord = req.query.search
        const query = { name: { $regex: '.*' + searchWord + '.*', $options: 'i' } }
        const sortOption = req.query.sort
        const page = req.query.page || 1; 
        const categoryData = await Category.find();
        const itemsPerPage = 4; 
        const skip = (page - 1) * itemsPerPage;

        const sortCriteria = {};
        if (sortOption === 'price_low') {
        sortCriteria.price = 1; 
        } else if (sortOption === 'price_high') {
        sortCriteria.price = -1; 
        }

        const productData = await Product.find(query)
            .populate("category")
            .sort(sortCriteria)
            .skip(skip)
            .limit(itemsPerPage);

        const imageUrl = [];
        if (productData) {
            for (const product of productData) {
                const images = product.image.map((image) => {
                    return `/product-images/${image.filename}`;
                });
                imageUrl.push(images);
            }
        }

        const totalProducts = await Product.countDocuments(query);

        if (productData) {
            res.render('search-product', {
                user: user,
                imageUrl,
                sortOption,
                products: productData,
                category: categoryData,
                filter_id:searchWord,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / itemsPerPage), // Calculate total pages
            });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const search = async(req,res)=>{
    try {
        const sort = req.body.selectedSort
        const searchWord = req.body.search 
        console.log("k",req.body);
        if (sort) {
            res.redirect(`/users/search?&search=${searchWord}&sort=${sort}`)
        }
        res.redirect(`/users/search?search=${searchWord}`)
   
    } catch (error) {
        console.log(error.message);
    }
}

const loadFilter = async (req, res) => {
    try {
        console.log(req.query);
        const user = req.session.name; // func for search, sort, filter category

        var searchWord ;
        if (req.query.search) {
            searchWord = req.query.search;
        }

        var filter_id ;
        if (req.query.filter) {
            filter_id = req.query.filter;
        }

        const sortOption = req.query.sort || '';
        const page = req.query.page || 1;

        const categoryData = await Category.find();
        const itemsPerPage = 4;
        const skip = (page - 1) * itemsPerPage;

        let query = {};

        if (filter_id) {
            query.category = filter_id;
        }

        if (searchWord) {
            query.name = { $regex: '.*' + searchWord + '.*', $options: 'i' };
        }

        console.log('Query:', query);

        const sortCriteria = {};
        if (sortOption === 'price_low') {
            sortCriteria.price = 1;
        } else if (sortOption === 'price_high') {
            sortCriteria.price = -1;
        }

        const productData = await Product.find(query)
            .populate('category')
            .sort(sortCriteria)
            .skip(skip)
            .limit(itemsPerPage);

        //console.log(productData);

        const imageUrl = [];
        if (productData) {
            for (const product of productData) {
                const images = product.image.map((image) => {
                    return `/product-images/${image.filename}`;
                });
                imageUrl.push(images);
            }
        }

        const totalProducts = await Product.countDocuments(query);

        if (productData) {
            res.render('filter', {
                user: user,
                imageUrl,
                sortOption,
                products: productData,
                category: categoryData,
                filter_id: filter_id,
                searchWord: searchWord,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / itemsPerPage),
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const filter = async(req,res)=>{
    try {
        const {sort, filter_id, search} = req.body

        //console.log('Body',req.body);
        res.redirect(`/users/filter?${filter_id ? `&filter=${filter_id}` : ''}${sort ? `&sort=${sort}` : ''}${search ? `&search=${search}` : ''}`);

    } catch (error) {
        console.log(error.message);
    }
}

const singleItem = async(req,res)=>{
    try {
        const user = req.session.name
        const id = req.query.id
        const productData = await Product.findById({_id:id}).populate("category");

        const imageUrls = [];
        if (productData) {
        const images = productData.image.map((image) => {
            return `/product-images/${image.filename}`;
        });
        imageUrls.push(images);
    }


        res.render('single-item',{
            user,
            imageUrls,
            product : productData
        })
    } catch (error) {
        console.log(error.message);
    }
} 

const editUser = async(req,res)=>{
    try {
        const user = req.session.name
        const id = req.query.id
        const userData = await User.findById({_id:id})
        if (userData) {
            res.render('edit-user',{
                user,
                users:userData
            })   
        } else {
            res.redirect('/users/profile')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateUser = async(req,res)=>{
    try {
        const userData = await User.findByIdAndUpdate({_id:req.body.id},{$set:{
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno
        }})
        res.redirect('/users/profile?message=User updated')
    } catch (error) {
        console.log(error.message);
    }
}

const sendMailReset = async(name,email,token)=>{
    try {
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{ 
                user:config.emailUser,
                pass:config.emailPassword                         // 'kdkt samg gqka skhk'
            }
        })
        const mailOptions = {
            from:config.emailUser,
            to:email,
            subject:'For Reset Password',
            html:'<p>Hi ' + name + ',please click here to <a href="http://localhost:5000/forgetPassword?token='+token+'"> Reset </a> your password.</p> '
        }
        transporter.sendMail(mailOptions, function(error,info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent:-',info.response);
            }  
        })
    } catch (error) {
        console.log(error.message);
    }
}
 
const forgetLoad = async(req,res)=>{
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message);
    }
}

const generateRandomString = () => {
    const randomString = randomstring.generate({
        length: 5,
        charset: 'alphabetic', // Use 'alphanumeric' if you want alphanumeric characters
        capitalization: 'uppercase', // Use 'uppercase' for uppercase characters
    });

    return randomString;
};

const forgetVerify = async(req,res)=>{
    try {
        const email = req.body.email
        const userData = await User.findOne({email: email})
        if(userData){
            if (userData.is_verified === 0) {
                res.render('forget',{message:'please verify your email'})
            } else {
                const randomString = generateRandomString()
                console.log(randomString);
                const updatedData = await User.updateOne({email: email},{$set:{token: randomString}})
                sendMailReset(userData.name,userData.email,randomString)
                res.render('forget',{message:'Please check your email to reset password'})
            }
        }else{
            res.render('forget',{message:'User email is incorrect'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async(req,res)=>{
    try {
        const token = req.query.token
        const tokenData = await User.findOne({token:token})

        if (tokenData) {
            res.render('reset-password',{user_id: tokenData._id})
        } else {
            res.render('404',{message:'Token is Invalid'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async(req,res)=>{
    try {
        const password = req.body.password
        const user_id = req.body.user_id
        const cpassword = req.body.cpassword

        if(password !== cpassword){
            res.render('reset-password',{
                message: 'Passwords do not match',
                user_id
            })

        } else {                                      
            const spassword = await securePassword(password)
            const updatedData = await User.updateOne(
            {_id:user_id},
            {$set:{
                password:spassword,
                token:''
            }})
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const productList = async(req,res)=>{
    try {
        const productData = await Product.find().populate("category")
        const category = await Category.find();
        const user = req.session.name
        const message = req.query.message

        const imageUrl = []
        if(productData){
            for (const product of productData){
                 const images = await Promise.all(
                    product.image.map(async(image) => {
                        const FullImageUrl = await cropImage(image);
                        return FullImageUrl
                }))
                imageUrl.push(images)
            }
        } 
        if(user){
            res.render('product-list',{ 
                user,
                products:productData,
                imageUrl,
                category,
                message
            });

        }else{ 
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.messagew);
    }
}

module.exports = {
    loadLandPage,
    loginPage,
    logout,
    verifyLogin,
    insertUser,
    loadHome,
    loadRegister,
    verifyMail ,
    verifyOtp,
    otpPage,
    resendOTP,
    searchLoad,
    search,
    loadFilter,
    filter,
    singleItem,
    editUser,
    updateUser,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    productList,
    referralPage
}; 