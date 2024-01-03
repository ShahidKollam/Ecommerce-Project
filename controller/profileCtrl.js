const Cart_item = require("../models/cartModel")
const Address = require('../models/addressModel')
const User = require('../models/userModel')
const bcrypt = require('bcrypt')

const userProfile = async(req,res)=>{
    try {
        const user = req.session.name
        const id = req.session.user
        const { message } = req.query
        const userData = await User.findById({_id: id})
        const addressData = await Address.find({user_id: id}).populate('user_id')
        res.render('user_profile',{
            user,
            userData,
            message,
            address : addressData
        })
    } catch (error) {
        console.log(error.message);
    }
}

const securePassword = async(password)=>{
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash

    } catch (error) {
        console.log(error.message);
    } 
}  

const new_address = async(req,res)=>{
    try {
        const user = req.session.name
        res.render('add-address',{
            user,
        })
    } catch (error) {
        console.log(error.message);
    }
} 

const add_address = async(req,res)=>{
    try {
        const house = req.body.house
        const userId = req.session.user
        const data = await Address.findOne({house:house})

        if(!data){
            const address = new Address({
                name : req.body.name,
                house : req.body.house,
                street : req.body.street,
                city : req.body.city,
                state : req.body.state,
                pin : req.body.zip,
                is_default : false,
                user_id : userId
            })
            const addressData = await address.save()
            res.redirect('/users/profile?message=Address Added Successfully'); 
        }
    } catch (error) {
        console.log(error.message);
    }
} 

const updateAddress = async (req, res)=>{
    try {
        const { name, house, street, city, state, pin, id } = req.body;

        const updatedAddress = await Address.findByIdAndUpdate(
            id,
            {
                name, house, street, city, state, pin,
            },
            { new: true } 
        );

        if (!updatedAddress) {
            return res.status(404).send('Address not found');
        }

        res.redirect('/users/profile?message=Address Updated');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const editAddress = async(req,res)=>{
    try {
        const user = req.session.name
        const { id } =req.query

        const addressData = await Address.findById({_id: id})
        console.log(addressData);
        res.render('edit-address',{
            user,
            addressData,
        })
    } catch (error) {
        console.log(error.message);
    }
} 

const deleteAddress = async(req,res)=>{
    try {
        console.log(req.params);
        const {addressId} = req.params

        const result = await Address.findOneAndRemove({ _id: addressId });

        if (!result) {
            return res.status(404).send('Address not found');
        }

        res.redirect('/users/profile?message=Address Deleted'); 

    } catch (error) {
        console.log(error.message);
    }
} 

const changePassword = async(req,res)=>{
    try {
        const user = req.session.name
        const { id, message } = req.query
        const userData = await User.findById({_id: id})
        const user_id = userData._id

        res.render('change-password',{
            user_id,
            user,
            message
        })
    } catch (error) {
        console.log(error.message);
    }
}

const updatePassword = async(req,res)=>{
    try {
        const { password, cpassword, user_id, currentPassword, } = req.body
        const userData = await User.findById({_id: user_id})
        console.log(req.body);

        if (userData){
            const passwordMatch = await bcrypt.compare(currentPassword,userData.password)
            if(!passwordMatch){
               return res.redirect(`/changePassword?message=Give correct current password&id=${user_id}`)
            }
        }
        
        if (password !== cpassword){
            res.redirect(`/changePassword?message=New passwords do not match&id=${user_id}`)            
        } else {
            const spassword = await securePassword(password)
            const updatedData = await User.updateOne(
                {_id: user_id},
                {$set: { password:spassword }
            })
            console.log(updatedData);
            res.redirect('/users/profile?message=Password updated')
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    userProfile,
    new_address,
    add_address,
    editAddress,
    updateAddress,
    deleteAddress,
    changePassword,
    updatePassword
} 