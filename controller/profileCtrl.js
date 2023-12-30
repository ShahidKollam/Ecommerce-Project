const Cart_item = require("../models/cartModel")
const Address = require('../models/addressModel')

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
        const userName = req.session.name
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
            res.redirect('/checkout')
        }
    } catch (error) {
        console.log(error.message);
    }
} 

module.exports = {
    new_address,
    add_address
}