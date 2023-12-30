const Admin = require('../models/userModel')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const bcrypt = require('bcrypt')
const randomString = require('randomstring')
const Order = require('../models/orderModel')

const securePassword = async(password)=>{
    try {
        const hashPassword = await bcrypt.hash(password,8)
        return hashPassword
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async(req,res)=>{
    try {
        if (req.session.admin_id) {
            return res.redirect('/admin/home')
        } else {
            res.render('admin-login')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password
        const adminData = await Admin.findOne({email:email})
        if (adminData) {
            const passwordMatch = await bcrypt.compare(password,adminData.password)
            if(passwordMatch){
                if(adminData.is_admin === 0){
                    res.render('admin-login',{message:"Not an Admin "})
                }else{
                    req.session.admin_id = adminData._id
                    req.session.adminName = adminData.name
                    req.session.adminEmail = adminData.email
                    res.redirect(`/admin/home`)
                }
        }else{
            res.render('admin-login',{error:"Invalid Password"})
        } 
    }else{
        res.render('admin-login',{error:"Email and Password is invalid"}) 
    }
    } catch (error) {
        console.log(error.message);
    }
} 

const loadHome = async(req,res)=>{
    try {
        const adminData = req.session
        const totalUsers = await User.countDocuments();
        const totalOrder = await Order.countDocuments();
        const totalProduct = await Product.countDocuments();

        const totalRevenueResult = await Order.aggregate([
            { $match: { status: 'Pending'} },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);

        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

        const monthlySalesData = await Order.aggregate([
            {
                $match: { status: 'Pending' }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$orderDate" }
                    },
                    totalSales: { $sum: "$totalAmount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    totalSales: 1
                }
            }
        ]);

        //console.log(monthlySalesData);
        


        console.log(totalRevenue);
        if (adminData) {
            res.render('admin-home',{
                adminName:adminData.adminName,
                adminEmail:adminData.adminEmail,
                totalRevenue,
                totalProduct,
                totalUsers,
                totalOrder,
                monthlySalesData
            });
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const chart = async (req, res) => {
    try {
      const { filter } = req.query;
      let filteredData = [];
  
      if (filter === 'monthly') {
        const monthlySalesData = await Order.aggregate([
          {
            $match: { status: 'Pending' }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m", date: "$orderDate" }
              },
              totalSales: { $sum: "$totalAmount" }
            }
          },
          {
            $project: {
              _id: 0,
              month: "$_id",
              totalSales: 1
            }
          }
        ]);
  
        filteredData = monthlySalesData;
        //console.log("Monthly Data:", filteredData);

      } else if (filter === 'yearly') {

        const yearlySalesData = await Order.aggregate([
          {
            $match: { status: 'Pending' }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y", date: "$orderDate" }
              },
              totalSales: { $sum: "$totalAmount" }
            }
          },
          {
            $project: {
              _id: 0,
              year: "$_id",
              totalSales: 1
            }
          }
        ]);
  
        filteredData = yearlySalesData;
        //console.log("Yearly Data:", filteredData);
      } else if (filter === 'weekly') {

        const weeklySalesData = await Order.aggregate([
            {
                $match: { status: 'Pending' }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%U", date: "$orderDate" }
                    },
                    totalSales: { $sum: "$totalAmount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    week: "$_id",
                    totalSales: 1
                }
            },
            {
                $sort: { week: 1 } 
            }
        ]);

        filteredData = weeklySalesData;
        //console.log("Weekly Data:", filteredData);
      }
      
      const responseData = {
        monthNames: filteredData.map(item => item.year || item.week || item.month) ,
        salesData: filteredData.map(item => item.totalSales),
        weeks: filteredData.map(item => item.week),
        years: filteredData.map(item => item.year),      
    };
      res.json(responseData);
    } catch (error) {                                  
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};
      
const logout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

const getUser = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const userData = await Admin.find({is_admin:0})
        //const blockData = await Admin.find({is_blocked:"Actived"})
        res.render('user-list',{adminEmail,adminName,users:userData})
    } catch (error) {
        console.log(error.message);
    }
}

const addUser = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        res.render('add-user',{adminEmail,adminName})
    } catch (error) {
        console.log(error.message);
    }
}

const saveUser = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const email = req.body.email
        const name = req.body.name
        const mno = req.body.mno
        const password = randomString.generate(4)
        const emailMatch = await Admin.findOne({email:email})
        const mobileMatch = await Admin.findOne({mobile:mno})
        if (emailMatch) {
            res.render('add-user',{message:'Email already exits',adminEmail,adminName})
        }else if(mobileMatch){
            res.render('add-user',{message:'Mobile.no already exits',adminEmail,adminName})
        }else{
            const spassword = await securePassword(password)
            const user = new Admin({
                name:name,
                email:email,
                mobile:mno,
                password:spassword,
                is_admin:0,
                is_verified:0,
                is_blocked:"Actived"
            })
            const userData = await user.save()
            if (userData) {
                res.redirect('/admin/add-user?info=New user added')
            } else {
                res.render('add-user',{message:'Somthing wrong...',adminEmail,adminName})
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const blockUser = async (req, res) => {
    try {
        const action = req.body.action;
        const userId = req.query.id; 
        console.log(action);
        if (action === "blocked") {
            const blockInfo = await Admin.updateOne({ _id: userId }, { $set: { is_blocked: false }});
            res.redirect(`/admin/get-user`);
            
        } else if (action === "actived") {
            const blockInfo = await Admin.updateOne({ _id: userId }, { $set: { is_blocked: true }});
            res.redirect(`/admin/get-user?success=blocked`);
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const unblockUser = async(req,res)=>{
    try {
        res.redirect('/admin/get-user')
    } catch (error) {
        console.log(error.message);
    }
}

const showOrder = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const orderData = await Order.find().populate({
            path: 'user_id',  
            model: 'User',    
          }).sort({orderDate:-1})
          
        res.render('order',{
            adminEmail,
            adminName,
            orderData: orderData
        })
    } catch (error) {
        console.log(error.message);
    }
}

const orderDetails = async(req,res)=>{
    try {
        const adminName = req.session.adminName
        const adminEmail = req.session.adminEmail
        const order_id = req.query.id
        const product_id = req.query.p_id

        const orderData = await Order.findById(order_id)
            .populate({
              path: 'orderItems.product',
              model: 'Product',
        }).populate("shippingAddress")

        res.render('order-detailsAdmin',{
            adminEmail,
            adminName,
            order: orderData,
            
        })
    } catch (error) {
        console.log(error.message);
    }
}

const updateStatus = async(req,res)=>{
    try {
        const {orderId, status} = req.body
        const update = await Order.findOneAndUpdate(
            {_id:orderId},
            {$set:{status:status}},
            {new:true}
        );
        console.log(update);
        res.json(update)
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadHome, 
    logout,
    addUser,
    getUser,
    saveUser,
    blockUser,
    showOrder,
    orderDetails,
    updateStatus,
    chart
}