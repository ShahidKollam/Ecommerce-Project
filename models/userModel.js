const mongoose = require('mongoose'); 

var userSchema = new mongoose.Schema({
    
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    }, 
    password:{
        type:String,
        required:true,
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_verified:{
        type:Number,
        required:true
    },
    is_blocked:{
        type:Boolean,
        required:true
    },
    referralCode: {
        type: String,
        unique: true,
    },
    referralHistory: [{
      referredUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      referredAt: {
        type: Date,
        default: Date.now,
      },
    }],
    token:{
        type:String,
        default:''
    }
});

module.exports = mongoose.model('User', userSchema);